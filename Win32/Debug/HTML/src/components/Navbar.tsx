import { LogOut, FlaskConical } from 'lucide-react'

type Screen = 'elemento' | 'grupo' | 'periodo' | 'familia' | 'categoria_quimica'

const LINKS: { id: Screen; label: string }[] = [
  { id: 'elemento',          label: 'Elementos' },
  { id: 'grupo',             label: 'Grupos' },
  { id: 'periodo',           label: 'Períodos' },
  { id: 'familia',           label: 'Famílias' },
  { id: 'categoria_quimica', label: 'Categorias' },
]

interface NavbarProps {
  current: Screen
  onChange: (s: Screen) => void
  onSair: () => void
}

export function Navbar({ current, onChange, onSair }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-[#001f3f] text-white px-6 py-0 shadow-2xl flex justify-between items-stretch">
      {/* Logo — só navega visualmente, não fecha */}
      <div className="flex items-center gap-3 text-xl font-bold py-4 text-white select-none">
        <FlaskConical size={22} className="text-[#00d084]" />
        Sistema de Química
      </div>

      {/* Links */}
      <div className="flex gap-1">
        {LINKS.map(l => (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={`px-4 py-4 text-sm font-semibold tracking-wide transition border-b-2
              ${current === l.id
                ? 'border-[#00d084] text-[#00d084]'
                : 'border-transparent text-gray-300 hover:text-white hover:border-white/30'
              }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Sair — fecha o aplicativo pelo Delphi */}
      <button
        onClick={onSair}
        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition py-4 text-sm"
        title="Fechar o sistema"
      >
        <LogOut size={16} /> Sair
      </button>
    </nav>
  )
}
