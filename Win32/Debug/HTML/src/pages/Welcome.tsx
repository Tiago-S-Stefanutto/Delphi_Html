import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Welcome() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Animação de entrada
    const container = document.querySelector(".welcome-container");
    if (container) {
      container.classList.add("animate-fade-in");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001f3f] via-[#003d6b] to-[#00d084] relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute w-full h-full top-0 left-0 z-0 overflow-hidden">
        <div className="absolute w-80 h-80 bg-[#00d4ff] rounded-full -top-32 -right-32 opacity-10 animate-float"></div>
        <div className="absolute w-56 h-56 bg-[#00d084] rounded-full -bottom-16 -left-16 opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute w-40 h-40 bg-[#00d4ff] rounded-full bottom-32 right-12 opacity-10 animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Content */}
      <div className="welcome-container text-center text-white z-10 relative">
        <div className="text-6xl mb-8 flex justify-center gap-2">
          <span className="animate-bounce" style={{ animationDelay: "0s" }}>🧪</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>⚗️</span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>🔬</span>
        </div>

        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Sistema de Química</h1>
        <p className="text-2xl mb-8 font-light drop-shadow">Gerenciamento de Elementos e Propriedades Químicas</p>

        <p className="text-lg mb-12 max-w-2xl mx-auto opacity-95 leading-relaxed">
          Bem-vindo ao Sistema de Química! Uma plataforma moderna e intuitiva para gerenciar 
          elementos químicos, grupos, períodos, famílias e categorias da tabela periódica.
        </p>

        <button
          onClick={() => setLocation("/dashboard")}
          className="inline-block px-12 py-4 bg-[#00d084] text-[#001f3f] rounded-lg font-bold text-xl cursor-pointer transition-all duration-300 hover:bg-[#00d4ff] hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 shadow-lg"
        >
          Entrar no Sistema
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
