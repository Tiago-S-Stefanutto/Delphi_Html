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
  const backdropRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // ─── Mover foco para dentro do modal ao abrir ──────────────────────
  useEffect(() => {
    // Salvar o elemento que tinha foco antes do modal abrir
    previousActiveElement.current = document.activeElement as HTMLElement

    // Função para encontrar e focar no primeiro elemento focável
    const focusFirstElement = () => {
      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement

      if (firstElement) {
        // Usar setTimeout para garantir que o foco seja aplicado após a renderização
        setTimeout(() => {
          firstElement.focus()
        }, 0)
      }
    }

    focusFirstElement()

    // Cleanup: restaurar foco ao elemento anterior quando o modal fechar
    return () => {
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus()
      }
    }
  }, [])

  // ─── Tab Trap ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return

      // Obter todos os elementos focáveis dentro do modal
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]

      if (focusableArray.length === 0) return

      const firstElement = focusableArray[0]
      const lastElement = focusableArray[focusableArray.length - 1]
      const activeElement = document.activeElement

      // Se o foco está fora do modal, trazer para dentro
      if (!modal.contains(activeElement as Node)) {
        e.preventDefault()
        firstElement.focus()
        return
      }

      // Se Shift+Tab no primeiro elemento, ir para o último
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Se Tab no último elemento, ir para o primeiro
        if (activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Adicionar listener de keydown
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ─── Fechar ao pressionar Escape ───────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // ─── Fechar ao clicar no backdrop ──────────────────────────────────
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideIn flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 hover:rotate-90 transition-all duration-200 flex-shrink-0"
            aria-label="Fechar modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content - scrollable if needed */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
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
  const backdropRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // ─── Mover foco para dentro do modal ao abrir ──────────────────────
  useEffect(() => {
    // Salvar o elemento que tinha foco antes do modal abrir
    previousActiveElement.current = document.activeElement as HTMLElement

    // Função para encontrar e focar no primeiro botão (Cancelar)
    const focusFirstElement = () => {
      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement

      if (firstElement) {
        // Usar setTimeout para garantir que o foco seja aplicado após a renderização
        setTimeout(() => {
          firstElement.focus()
        }, 0)
      }
    }

    focusFirstElement()

    // Cleanup: restaurar foco ao elemento anterior quando o modal fechar
    return () => {
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus()
      }
    }
  }, [])

  // ─── Tab Trap ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return

      // Obter todos os elementos focáveis dentro do modal
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]

      if (focusableArray.length === 0) return

      const firstElement = focusableArray[0]
      const lastElement = focusableArray[focusableArray.length - 1]
      const activeElement = document.activeElement

      // Se o foco está fora do modal, trazer para dentro
      if (!modal.contains(activeElement as Node)) {
        e.preventDefault()
        firstElement.focus()
        return
      }

      // Se Shift+Tab no primeiro elemento, ir para o último
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Se Tab no último elemento, ir para o primeiro
        if (activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Adicionar listener de keydown
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ─── Fechar ao pressionar Escape ───────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  // ─── Fechar ao clicar no backdrop ──────────────────────────────────
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onCancel()
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[110] flex items-center justify-center modal-backdrop p-4"
      onClick={handleBackdropClick}
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
