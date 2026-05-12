import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement

    // Bloqueia scroll do body enquanto modal estiver aberto
    document.body.style.overflow = 'hidden'

    const focusFirstElement = () => {
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable[0]) setTimeout(() => focusable[0].focus(), 0)
    }
    focusFirstElement()

    return () => {
      document.body.style.overflow = ''
      if (previousActiveElement.current?.focus) previousActiveElement.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const modal = modalRef.current
      if (!modal) return
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); return }
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus() } }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    /*
      O backdrop ocupa a tela toda e tem overflow-y: auto.
      O conteúdo dentro cresce livremente — sem altura máxima —
      e o backdrop provê o scroll quando necessário.
    */
    <div
      className="fixed inset-0 z-[100] modal-backdrop"
      style={{ overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex justify-center min-h-full py-10 px-4">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slideIn self-start"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-lg font-bold tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="opacity-70 hover:opacity-100 hover:rotate-90 transition-all duration-200"
              aria-label="Fechar modal"
            >
              <X size={22} />
            </button>
          </div>

          {/* Conteúdo — sem overflow, sem altura máxima, cresce com o conteúdo */}
          <div className="p-6">
            {children}
          </div>
        </div>
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
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    const focusFirstElement = () => {
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable[0]) setTimeout(() => focusable[0].focus(), 0)
    }
    focusFirstElement()
    return () => {
      document.body.style.overflow = ''
      if (previousActiveElement.current?.focus) previousActiveElement.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCancel(); return }
      if (e.key !== 'Tab') return
      const modal = modalRef.current
      if (!modal) return
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); return }
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus() } }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center modal-backdrop p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-slideIn text-center"
      >
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
