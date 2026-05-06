import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ListagemGenericaProps {
  titulo: string;
  icone: string;
  endpoint: string;
  formPage: string;
  colunas: { chave: string; label: string }[];
  entityType: string;
}

export default function ListagemGenerica({
  titulo,
  icone,
  endpoint,
  formPage,
  colunas,
  entityType,
}: ListagemGenericaProps) {
  const [, setLocation] = useLocation();
  const [dados, setDados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const response = await fetch(`http://localhost:9000${endpoint}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }
      const data = await response.json();
      setDados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar dados. Verifique se a API está acessível em http://localhost:9000");
      setDados([]);
    } finally {
      setCarregando(false);
    }
  };

  const dadosFiltrados = dados.filter((item) =>
    Object.values(item).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase())
    )
  );

  const excluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      const response = await fetch(`http://localhost:9000${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao excluir");
      setDados(dados.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir item");
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
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#001f3f] mb-2">
            {icone} {titulo}
          </h1>
          <p className="text-gray-600">Gerenciar {titulo.toLowerCase()}</p>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <button
            onClick={() => setLocation(formPage)}
            className="bg-[#001f3f] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#003d6b] transition"
          >
            ➕ Novo {entityType}
          </button>
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#001f3f]"
          />
        </div>

        {/* Error Message */}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}

        {/* Table */}
        {carregando ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : dadosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#001f3f] text-white">
                <tr>
                  {colunas.map((col) => (
                    <th key={col.chave} className="px-6 py-3 text-left font-bold">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    {colunas.map((col) => (
                      <td key={col.chave} className="px-6 py-4">
                        {item[col.chave] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => setLocation(`${formPage}?id=${item.id}`)}
                        className="bg-[#001f3f] text-white px-3 py-1 rounded text-sm hover:bg-[#003d6b] transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => excluir(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#001f3f] text-white text-center py-6 mt-12">
        <p>&copy; 2024 Sistema de Química. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
