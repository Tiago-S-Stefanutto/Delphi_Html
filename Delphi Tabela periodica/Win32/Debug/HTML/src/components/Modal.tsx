import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center modal-backdrop pt-20 pb-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 hover:rotate-90 transition-all duration-200"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  mensagem: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ mensagem, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-slideIn text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmar Exclusão</h2>
        <p className="text-gray-500 text-sm mb-6">{mensagem}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
