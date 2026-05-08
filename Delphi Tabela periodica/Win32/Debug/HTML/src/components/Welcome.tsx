import { useEffect } from 'react'

interface WelcomeProps {
  onEntrar: () => void
}

export function Welcome({ onEntrar }: WelcomeProps) {
  // Enter na tela de boas-vindas entra no sistema
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter') onEntrar()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onEntrar])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001f3f] via-[#003d6b] to-[#00d084] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute w-96 h-96 bg-[#00d4ff] rounded-full -top-32 -right-32 opacity-10 animate-float" />
      <div
        className="absolute w-64 h-64 bg-[#00d084] rounded-full -bottom-20 -left-20 opacity-10 animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute w-48 h-48 bg-white rounded-full top-1/2 left-1/4 opacity-5 animate-float"
        style={{ animationDelay: '4s' }}
      />

      <div className="text-center text-white z-10 relative animate-fadeUp px-8">
        <div className="text-7xl mb-8 flex justify-center gap-3">
          <span className="animate-bounce inline-block">🧪</span>
          <span className="animate-bounce inline-block" style={{ animationDelay: '0.15s' }}>⚗️</span>
          <span className="animate-bounce inline-block" style={{ animationDelay: '0.30s' }}>🔬</span>
        </div>

        <h1 className="text-6xl font-bold mb-3 drop-shadow-lg tracking-tight">
          Sistema de Química
        </h1>
        <p className="text-2xl mb-2 font-light opacity-80">
          Gerenciamento de Elementos e Propriedades Químicas
        </p>
        <p className="text-sm opacity-50 mb-2 font-mono tracking-widest uppercase">
          Conectado ao banco de dados
        </p>
        <p className="text-xs opacity-30 mb-10 font-mono">
          Pressione Enter ou clique para entrar
        </p>

        <button
          onClick={onEntrar}
          className="inline-block px-14 py-4 bg-[#00d084] text-[#001f3f] rounded-2xl font-bold text-xl
                     cursor-pointer transition-all duration-300 hover:bg-[#00d4ff] hover:shadow-2xl
                     hover:-translate-y-1 active:translate-y-0 shadow-lg animate-pulse-g"
        >
          Entrar no Sistema
        </button>
      </div>
    </div>
  )
}
