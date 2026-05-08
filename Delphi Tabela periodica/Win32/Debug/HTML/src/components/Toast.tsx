import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastData {
  id: number
  tipo: 'ok' | 'erro'
  msg: string
}

interface ToastProps {
  toasts: ToastData[]
  remove: (id: number) => void
}

export function ToastContainer({ toasts, remove }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} remove={remove} />
      ))}
    </div>
  )
}

function Toast({ toast, remove }: { toast: ToastData; remove: (id: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => remove(toast.id), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast.id, remove])

  const isOk = toast.tipo === 'ok'

  return (
    <div
      style={{
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(100px)',
      }}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-medium max-w-sm
        ${isOk ? 'bg-[#001f3f] border border-[#00d084]/40' : 'bg-red-700'}`}
    >
      {isOk
        ? <CheckCircle size={20} className="text-[#00d084] shrink-0" />
        : <XCircle size={20} className="text-red-200 shrink-0" />
      }
      <span className="text-sm flex-1">{toast.msg}</span>
      <button onClick={() => remove(toast.id)} className="opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  )
}
