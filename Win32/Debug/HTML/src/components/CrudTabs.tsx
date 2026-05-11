import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const API = "http://localhost:9000";

interface Campo {
  nome: string;
  label: string;
  tipo: "text" | "number" | "textarea" | "select";
  obrigatorio?: boolean;
  step?: string;
  opcoes?: "grupos" | "periodos" | "familias" | "categorias";
}

interface CrudTabsProps {
  titulo: string;
  icone: string;
  endpoint: string;
  colunas: { chave: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  campos: Campo[];
  navLinks?: { label: string; href: string; active?: boolean }[];
}

interface SelectOption {
  id: number;
  descricao?: string;
  nome?: string;
}

type Tab = "lista" | "novo" | "editar" | "excluir";

const NAV_DEFAULT = [
  { label: "Elementos", href: "/elementos" },
  { label: "Grupos", href: "/grupos" },
  { label: "Períodos", href: "/periodos" },
  { label: "Famílias", href: "/familias" },
  { label: "Categorias", href: "/categorias" },
];

export default function CrudTabs({ titulo, icone, endpoint, colunas, campos, navLinks }: CrudTabsProps) {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("lista");

  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState<Record<string, any>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  const [opcoesMap, setOpcoesMap] = useState<Record<string, SelectOption[]>>({});

  const emptyForm = () => Object.fromEntries(campos.map(c => [c.nome, ""]));

  useEffect(() => {
    carregar();
    carregarOpcoes();
  }, []);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const carregar = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}${endpoint}`);
      const data = await r.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch {
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarOpcoes = async () => {
    const selectCampos = campos.filter(c => c.tipo === "select" && c.opcoes);
    const map: Record<string, SelectOption[]> = {};
    for (const campo of selectCampos) {
      try {
        const r = await fetch(`${API}/${campo.opcoes}`);
        const data = await r.json();
        map[campo.nome] = Array.isArray(data) ? data : [];
      } catch {
        map[campo.nome] = [];
      }
    }
    setOpcoesMap(map);
  };

  const abrirEditar = (row: any) => {
    setForm({ ...row });
    setSelectedId(row.id);
    setTab("editar");
  };

  const abrirExcluir = (row: any) => {
    setForm({ ...row });
    setSelectedId(row.id);
    setTab("excluir");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const campo = campos.find(c => c.nome === name);
    setForm(prev => ({
      ...prev,
      [name]: value === "" ? "" : (campo?.tipo === "number" ? Number(value) : value),
    }));
  };

  const salvar = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const method = tab === "novo" ? "POST" : "PUT";
      const url = tab === "novo" ? `${API}${endpoint}` : `${API}${endpoint}/${selectedId}`;
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      setFeedback({ tipo: "ok", msg: tab === "novo" ? "Registro criado com sucesso!" : "Registro atualizado com sucesso!" });
      await carregar();
      if (tab === "novo") setForm(emptyForm());
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao salvar. Verifique a API." });
    } finally {
      setSaving(false);
    }
  };

  const excluir = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const r = await fetch(`${API}${endpoint}/${selectedId}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setFeedback({ tipo: "ok", msg: "Registro excluído com sucesso!" });
      await carregar();
      setSelectedId(null);
      setForm(emptyForm());
      setTab("lista");
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao excluir. Verifique a API." });
    } finally {
      setSaving(false);
    }
  };

  const filtrados = registros.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(busca.toLowerCase()))
  );

  const currentPath = window.location.pathname;
  const nav = navLinks || NAV_DEFAULT.map(n => ({ ...n, active: n.href === currentPath }));

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "lista", label: "Listar", icon: "ti-list" },
    { key: "novo", label: "Novo", icon: "ti-plus" },
    { key: "editar", label: "Editar", icon: "ti-edit" },
    { key: "excluir", label: "Excluir", icon: "ti-trash" },
  ];

  const handleTabClick = (key: Tab) => {
    if (key === "novo") { setForm(emptyForm()); setSelectedId(null); }
    setFeedback(null);
    setTab(key);
  };

  const renderForm = (readOnly = false) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      {campos.map(campo => (
        <div key={campo.nome} style={{ gridColumn: campo.tipo === "textarea" ? "1 / -1" : undefined, display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {campo.label}{campo.obrigatorio && !readOnly ? " *" : ""}
          </label>
          {campo.tipo === "textarea" ? (
            <textarea
              name={campo.nome}
              value={form[campo.nome] ?? ""}
              onChange={handleChange}
              disabled={saving || readOnly}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border-tertiary)", background: readOnly ? "var(--color-background-secondary)" : "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
            />
          ) : campo.tipo === "select" ? (
            <select
              name={campo.nome}
              value={form[campo.nome] ?? ""}
              onChange={handleChange}
              disabled={saving || readOnly}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border-tertiary)", background: readOnly ? "var(--color-background-secondary)" : "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: "14px" }}
            >
              <option value="">Selecione...</option>
              {(opcoesMap[campo.nome] || []).map(op => (
                <option key={op.id} value={op.id}>{op.descricao || op.nome || op.id}</option>
              ))}
            </select>
          ) : (
            <input
              name={campo.nome}
              type={campo.tipo}
              value={form[campo.nome] ?? ""}
              onChange={handleChange}
              disabled={saving || readOnly}
              step={campo.step}
              readOnly={readOnly}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border-tertiary)", background: readOnly ? "var(--color-background-secondary)" : "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: "14px", boxSizing: "border-box" }}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "linear-gradient(135deg, #001f3f 0%, #003d6b 100%)",
        padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "white" }}>
          <span style={{ fontSize: "22px" }}>🧪</span>
          <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em" }}>Sistema de Química</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {nav.map(item => (
            <button key={item.href} onClick={() => setLocation(item.href)} style={{
              background: item.active ? "rgba(255,255,255,0.15)" : "transparent",
              border: "none",
              color: item.active ? "white" : "rgba(255,255,255,0.65)",
              padding: "8px 16px", borderRadius: "8px",
              fontSize: "14px", fontWeight: item.active ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s",
              borderBottom: item.active ? "2px solid #00d084" : "2px solid transparent",
            }}>{item.label}</button>
          ))}
          <button onClick={() => setLocation("/")} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
            color: "rgba(255,255,255,0.65)", padding: "8px 16px",
            borderRadius: "8px", fontSize: "14px", cursor: "pointer", marginLeft: "8px"
          }}>
            <i className="ti ti-logout" aria-hidden="true" /> Sair
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #001f3f, #003d6b)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px"
            }}>{icone}</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#001f3f", margin: 0, letterSpacing: "-0.03em" }}>
              {titulo}
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginLeft: "58px" }}>
            Gerenciar os registros de {titulo.toLowerCase()}
          </p>
        </div>

        {/* Card with tabs */}
        <div style={{
          background: "white", borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
          overflow: "hidden"
        }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 4px" }}>
            {TABS.map(t => {
              const active = tab === t.key;
              const danger = t.key === "excluir";
              return (
                <button key={t.key} onClick={() => handleTabClick(t.key)} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "16px 20px", background: "none", border: "none",
                  borderBottom: active ? `3px solid ${danger ? "#e74c3c" : "#001f3f"}` : "3px solid transparent",
                  color: active ? (danger ? "#e74c3c" : "#001f3f") : "#94a3b8",
                  fontWeight: active ? 600 : 400, fontSize: "14px", cursor: "pointer",
                  transition: "all 0.15s", marginBottom: "-1px",
                }}>
                  <i className={`ti ${t.icon}`} style={{ fontSize: "16px" }} aria-hidden="true" />
                  {t.label}
                  {t.key === "lista" && registros.length > 0 && (
                    <span style={{
                      background: active ? "#001f3f" : "#e2e8f0",
                      color: active ? "white" : "#64748b",
                      fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "999px",
                    }}>{registros.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div style={{
              padding: "12px 24px", fontSize: "14px", fontWeight: 500,
              background: feedback.tipo === "ok" ? "#f0fdf4" : "#fef2f2",
              color: feedback.tipo === "ok" ? "#15803d" : "#b91c1c",
              borderBottom: `1px solid ${feedback.tipo === "ok" ? "#bbf7d0" : "#fecaca"}`,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <i className={`ti ${feedback.tipo === "ok" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: "18px" }} aria-hidden="true" />
              {feedback.msg}
            </div>
          )}

          {/* LISTA */}
          {tab === "lista" && (
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "12px" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
                  <i className="ti ti-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }} aria-hidden="true" />
                  <input
                    type="text" placeholder={`Buscar ${titulo.toLowerCase()}...`}
                    value={busca} onChange={e => setBusca(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", color: "var(--color-text-primary)", background: "var(--color-background-primary)" }}
                  />
                </div>
                <button onClick={() => handleTabClick("novo")} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#001f3f", color: "white",
                  border: "none", borderRadius: "8px", padding: "10px 18px",
                  fontSize: "14px", fontWeight: 600, cursor: "pointer",
                }}>
                  <i className="ti ti-plus" aria-hidden="true" />
                  Novo Registro
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  Carregando...
                </div>
              ) : filtrados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <i className="ti ti-inbox" style={{ fontSize: "40px", display: "block", marginBottom: "12px" }} aria-hidden="true" />
                  Nenhum registro encontrado
                </div>
              ) : (
                <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {colunas.map(col => (
                          <th key={col.chave} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>
                            {col.label}
                          </th>
                        ))}
                        <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map((row, i) => (
                        <tr key={row.id}
                          style={{ background: i % 2 === 0 ? "white" : "#fafafa", transition: "background 0.1s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")}
                          onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa")}
                        >
                          {colunas.map(col => (
                            <td key={col.chave} style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                              {col.render ? col.render(row[col.chave], row) : (row[col.chave] ?? "-")}
                            </td>
                          ))}
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button onClick={() => abrirEditar(row)} style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                background: "#eff6ff", color: "#1d4ed8",
                                border: "1px solid #bfdbfe", borderRadius: "6px",
                                padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                              }}>
                                <i className="ti ti-edit" style={{ fontSize: "14px" }} aria-hidden="true" /> Editar
                              </button>
                              <button onClick={() => abrirExcluir(row)} style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                background: "#fef2f2", color: "#dc2626",
                                border: "1px solid #fecaca", borderRadius: "6px",
                                padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                              }}>
                                <i className="ti ti-trash" style={{ fontSize: "14px" }} aria-hidden="true" /> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && filtrados.length > 0 && (
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px", textAlign: "right" }}>
                  {filtrados.length} de {registros.length} registro{registros.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* NOVO */}
          {tab === "novo" && (
            <div style={{ padding: "28px 32px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#001f3f", margin: "0 0 4px" }}>Novo Registro</h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Preencha os campos abaixo</p>
              </div>
              {renderForm()}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
                <button onClick={() => { setForm(emptyForm()); setFeedback(null); }} disabled={saving}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                  Limpar
                </button>
                <button onClick={salvar} disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 24px", borderRadius: "8px",
                    background: saving ? "#94a3b8" : "#001f3f", color: "white",
                    border: "none", fontSize: "14px", fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}>
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          )}

          {/* EDITAR */}
          {tab === "editar" && (
            <div style={{ padding: "28px 32px" }}>
              {!selectedId ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <i className="ti ti-arrow-left" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }} aria-hidden="true" />
                  <p>Selecione um registro na lista para editar.</p>
                  <button onClick={() => setTab("lista")} style={{ marginTop: "12px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#001f3f", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    Ir para Lista
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#001f3f", margin: "0 0 4px" }}>Editar Registro</h2>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Atualize as informações do registro selecionado</p>
                    </div>
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 600 }}>ID #{selectedId}</span>
                  </div>
                  {renderForm()}
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
                    <button onClick={() => { setSelectedId(null); setTab("lista"); }} disabled={saving}
                      style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                      Cancelar
                    </button>
                    <button onClick={salvar} disabled={saving}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 24px", borderRadius: "8px",
                        background: saving ? "#94a3b8" : "#1d4ed8", color: "white",
                        border: "none", fontSize: "14px", fontWeight: 600,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}>
                      <i className="ti ti-device-floppy" aria-hidden="true" />
                      {saving ? "Salvando..." : "Atualizar"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* EXCLUIR */}
          {tab === "excluir" && (
            <div style={{ padding: "28px 32px" }}>
              {!selectedId ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <i className="ti ti-arrow-left" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }} aria-hidden="true" />
                  <p>Selecione um registro na lista para excluir.</p>
                  <button onClick={() => setTab("lista")} style={{ marginTop: "12px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#001f3f", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    Ir para Lista
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: "520px", margin: "0 auto" }}>
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "24px", marginBottom: "28px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#991b1b", margin: "0 0 8px" }}>Confirmar Exclusão</h2>
                    <p style={{ fontSize: "14px", color: "#b91c1c", margin: 0 }}>Esta ação é irreversível. O registro será removido permanentemente.</p>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "20px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>Registro a ser excluído</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px", textTransform: "uppercase" }}>ID</p>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b", margin: 0 }}>#{form.id}</p>
                      </div>
                      {campos.slice(0, 5).map(campo => (
                        <div key={campo.nome}>
                          <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px", textTransform: "uppercase" }}>{campo.label}</p>
                          <p style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b", margin: 0 }}>{form[campo.nome] || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button onClick={() => { setSelectedId(null); setForm(emptyForm()); setTab("lista"); }} disabled={saving}
                      style={{ flex: 1, padding: "12px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#374151", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                      Cancelar
                    </button>
                    <button onClick={excluir} disabled={saving}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        padding: "12px 20px", borderRadius: "8px",
                        background: saving ? "#94a3b8" : "#dc2626", color: "white",
                        border: "none", fontSize: "14px", fontWeight: 600,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}>
                      <i className="ti ti-trash" aria-hidden="true" />
                      {saving ? "Excluindo..." : "Excluir Definitivamente"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer style={{ background: "#001f3f", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "20px", marginTop: "48px", fontSize: "13px" }}>
        © 2024 Sistema de Química. Todos os direitos reservados.
      </footer>
    </div>
  );
}
