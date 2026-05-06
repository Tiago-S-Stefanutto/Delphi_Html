import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface Campo {
  nome: string;
  label: string;
  tipo: "text" | "number" | "textarea" | "select";
  obrigatorio?: boolean;
  opcoes?: { id: number; descricao: string; nome?: string }[];
  step?: string;
}

interface FormularioGenericoProps {
  titulo: string;
  icone: string;
  endpoint: string;
  campos: Campo[];
  listaPage: string;
  entityType: string;
}

export default function FormularioGenerico({
  titulo,
  icone,
  endpoint,
  campos,
  listaPage,
  entityType,
}: FormularioGenericoProps) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [opcoesSelects, setOpcoesSelects] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
      setId(Number(idParam));
      carregarDados(Number(idParam));
    }
    carregarOpcoes();
  }, []);

  const carregarOpcoes = async () => {
    const selectCampos = campos.filter((c) => c.tipo === "select");
    for (const campo of selectCampos) {
      try {
        const response = await fetch(`http://localhost:9000${endpoint.replace(/\/\d+$/, "")}`);
        if (response.ok) {
          const data = await response.json();
          setOpcoesSelects((prev) => ({
            ...prev,
            [campo.nome]: Array.isArray(data) ? data : [],
          }));
        }
      } catch (error) {
        console.error(`Erro ao carregar opções para ${campo.nome}:`, error);
      }
    }
  };

  const carregarDados = async (itemId: number) => {
    try {
      setCarregando(true);
      const response = await fetch(`http://localhost:9000${endpoint}/${itemId}`);
      if (!response.ok) throw new Error("Erro ao carregar");
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar dados");
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    try {
      setCarregando(true);
      const method = id ? "PUT" : "POST";
      const url = id ? `http://localhost:9000${endpoint}/${id}` : `http://localhost:9000${endpoint}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao salvar");
      setSucesso(true);
      setTimeout(() => setLocation(listaPage), 1500);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErro("Erro ao salvar. Verifique se a API está acessível.");
    } finally {
      setCarregando(false);
    }
  };

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
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#001f3f] mb-2">
            {icone} {id ? `Editar ${entityType}` : `Novo ${entityType}`}
          </h1>
          <p className="text-gray-600">Preencha os dados {entityType.toLowerCase()}</p>
        </div>

        {/* Messages */}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✓ Salvo com sucesso! Redirecionando...
          </div>
        )}

        {/* Form */}
        {carregando && !id ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            {campos.map((campo) => (
              <div key={campo.nome} className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {campo.label}
                  {campo.obrigatorio && <span className="text-red-600">*</span>}
                </label>

                {campo.tipo === "textarea" ? (
                  <textarea
                    name={campo.nome}
                    value={formData[campo.nome] || ""}
                    onChange={handleChange}
                    required={campo.obrigatorio}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#001f3f]"
                  />
                ) : campo.tipo === "select" ? (
                  <select
                    name={campo.nome}
                    value={formData[campo.nome] || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#001f3f]"
                  >
                    <option value="">Selecione uma opção...</option>
                    {(opcoesSelects[campo.nome] || []).map((opcao) => (
                      <option key={opcao.id} value={opcao.id}>
                        {opcao.descricao || opcao.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={campo.tipo}
                    name={campo.nome}
                    value={formData[campo.nome] || ""}
                    onChange={handleChange}
                    required={campo.obrigatorio}
                    step={campo.step}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#001f3f]"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-4 justify-center mt-8">
              <button
                type="submit"
                disabled={carregando}
                className="bg-[#001f3f] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#003d6b] transition disabled:opacity-50"
              >
                💾 Salvar
              </button>
              <button
                type="button"
                onClick={() => setLocation(listaPage)}
                className="bg-gray-400 text-white px-8 py-2 rounded-lg font-bold hover:bg-gray-500 transition"
              >
                ← Voltar
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#001f3f] text-white text-center py-6 mt-12">
        <p>&copy; 2024 Sistema de Química. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
