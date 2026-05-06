import { useLocation } from "wouter";
import { useRef, useState } from "react";

const BASE_URL = "http://localhost:9000";

const dashboardCards = [
  {
    icon: "⚛️",
    title: "Elementos",
    description: "Gerenciar elementos químicos da tabela periódica",
    href: "/elementos",
  },
  {
    icon: "📋",
    title: "Grupos",
    description: "Gerenciar grupos da tabela periódica",
    href: "/grupos",
  },
  {
    icon: "📈",
    title: "Períodos",
    description: "Gerenciar períodos da tabela periódica",
    href: "/periodos",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Famílias",
    description: "Gerenciar famílias de elementos químicos",
    href: "/familias",
  },
  {
    icon: "🏷️",
    title: "Categorias",
    description: "Gerenciar categorias de elementos",
    href: "/categorias",
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  // ─── Importar XLSX ───────────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("loading");
    setStatusMsg("Enviando arquivo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/importar-xlsx`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      setImportStatus("success");
      setStatusMsg("Arquivo importado com sucesso!");
    } catch (err: any) {
      setImportStatus("error");
      setStatusMsg(`Falha na importação: ${err.message}`);
    } finally {
      // limpa o input para permitir re-upload do mesmo arquivo
      e.target.value = "";
      setTimeout(() => { setImportStatus("idle"); setStatusMsg(""); }, 4000);
    }
  };

  // ─── Exportar XML ────────────────────────────────────────────────
  const handleExportXml = async () => {
    setExportStatus("loading");
    setStatusMsg("Gerando XML...");

    try {
      // Busca todos os endpoints em paralelo
      const endpoints = ["elementos", "grupos", "periodos", "familias", "categorias"];
      const results = await Promise.all(
        endpoints.map((ep) =>
          fetch(`${BASE_URL}/${ep}`).then((r) => {
            if (!r.ok) throw new Error(`Erro ao buscar ${ep}`);
            return r.json();
          })
        )
      );

      const [elementos, grupos, periodos, familias, categorias] = results;

      // Monta o XML
      const toXmlItems = (tag: string, items: any[]) =>
        items
          .map((item) => {
            const fields = Object.entries(item)
              .map(([k, v]) => `    <${k}>${String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</${k}>`)
              .join("\n");
            return `  <${tag}>\n${fields}\n  </${tag}>`;
          })
          .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<SistemaQuimica exportado="${new Date().toISOString()}">
  <Elementos>
${toXmlItems("Elemento", elementos)}
  </Elementos>
  <Grupos>
${toXmlItems("Grupo", grupos)}
  </Grupos>
  <Periodos>
${toXmlItems("Periodo", periodos)}
  </Periodos>
  <Familias>
${toXmlItems("Familia", familias)}
  </Familias>
  <Categorias>
${toXmlItems("Categoria", categorias)}
  </Categorias>
</SistemaQuimica>`;

      // Download automático
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quimica_${new Date().toISOString().slice(0, 10)}.xml`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus("success");
      setStatusMsg("XML exportado com sucesso!");
    } catch (err: any) {
      setExportStatus("error");
      setStatusMsg(`Falha na exportação: ${err.message}`);
    } finally {
      setTimeout(() => { setExportStatus("idle"); setStatusMsg(""); }, 4000);
    }
  };

  // ─── Helpers de estilo ────────────────────────────────────────────
  const statusColor =
    importStatus === "error" || exportStatus === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : importStatus === "success" || exportStatus === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-blue-100 border-blue-400 text-blue-700";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#001f3f] to-[#003d6b] text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span>🧪</span>
          <span>Sistema de Química</span>
        </div>
        <div className="flex gap-6">
          <button onClick={() => setLocation("/dashboard")} className="hover:text-[#00d084] transition">
            Dashboard
          </button>
          <button onClick={() => setLocation("/")} className="hover:text-[#00d084] transition">
            Sair
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#001f3f] mb-2">📊 Dashboard</h1>
          <p className="text-gray-600">Selecione uma opção para gerenciar os dados do sistema</p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dashboardCards.map((card) => (
            <button
              key={card.href}
              onClick={() => setLocation(card.href)}
              className="bg-gradient-to-br from-[#001f3f] to-[#003d6b] text-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center gap-4"
            >
              <div className="text-5xl">{card.icon}</div>
              <h3 className="text-2xl font-bold">{card.title}</h3>
              <p className="text-sm opacity-90">{card.description}</p>
            </button>
          ))}
        </div>

        {/* ── Importar / Exportar ── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-[#001f3f] mb-1">📂 Importar / Exportar</h3>
          <p className="text-gray-500 text-sm mb-5">
            Importe dados via planilha XLSX ou exporte todos os registros em formato XML.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Botão Importar XLSX */}
            <button
              onClick={handleImportClick}
              disabled={importStatus === "loading"}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[#1a7f37] hover:bg-[#166d2f] disabled:opacity-60 transition-all duration-200 shadow hover:shadow-md"
            >
              {importStatus === "loading" ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>📥</span>
              )}
              Importar XLSX
            </button>

            {/* Botão Exportar XML */}
            <button
              onClick={handleExportXml}
              disabled={exportStatus === "loading"}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[#0057b8] hover:bg-[#004099] disabled:opacity-60 transition-all duration-200 shadow hover:shadow-md"
            >
              {exportStatus === "loading" ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>📤</span>
              )}
              Exportar XML
            </button>
          </div>

          {/* Input oculto para arquivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Mensagem de status */}
          {statusMsg && (
            <div className={`mt-4 px-4 py-3 rounded-lg border text-sm font-medium ${statusColor}`}>
              {statusMsg}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-white border-l-4 border-[#001f3f] p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-[#001f3f] mb-2">ℹ️ Informações do Sistema</h3>
          <p className="text-gray-700 mb-2">
            Este sistema permite gerenciar de forma completa todos os elementos da tabela periódica,
            incluindo suas propriedades, classificações e relacionamentos. Utilize o menu acima para
            acessar cada módulo.
          </p>
          <p className="text-gray-700">
            <strong>API Base:</strong> {BASE_URL}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#001f3f] text-white text-center py-6 mt-12">
        <p>&copy; 2024 Sistema de Química. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}