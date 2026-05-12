import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal, ConfirmModal } from '@/components/Modal'
import type { MsgParaDelphi } from '@/types'

interface ItemSimples {
  id: string
  descricao: string
}

interface CrudSimplesProps {
  titulo: string
  icone: string
  subtitulo: string
  entidade: string
  idField: string
  labelColuna: string
  maxLengthDescricao: number
  itens: ItemSimples[]
  enviar: (msg: MsgParaDelphi) => void
  onRefresh: () => void
}

export function CrudSimples({
  titulo, icone, subtitulo, entidade, idField, labelColuna, maxLengthDescricao, itens, enviar, onRefresh
}: CrudSimplesProps) {
  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<ItemSimples | null>(null)
  const [deleteItem, setDeleteItem] = useState<ItemSimples | null>(null)
  const [descricao, setDescricao]   = useState('')

  function abrirNovo() {
    setEditItem(null)
    setDescricao('')
    setModalOpen(true)
  }

  function abrirEditar(item: ItemSimples) {
    setEditItem(item)
    setDescricao(item.descricao)
    setModalOpen(true)
  }

  function salvar() {
    if (!descricao.trim()) return
    if (editItem) {
      enviar({ acao: 'atualizar', entidade, [idField]: Number(editItem.id), descricao })
    } else {
      enviar({ acao: 'inserir', entidade, descricao })
    }
    setModalOpen(false)
    setTimeout(onRefresh, 400)
  }

  function excluir() {
    if (!deleteItem) return
    enviar({ acao: 'apagar', entidade, [idField]: Number(deleteItem.id) })
    setDeleteItem(null)
    setTimeout(onRefresh, 400)
  }

  return (
    <div className="animate-fadeUp">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#001f3f] mb-1">{icone} {titulo}</h1>
          <p className="text-gray-500 text-sm">{subtitulo}</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-[#001f3f] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#003d6b] transition text-sm"
        >
          <Plus size={16} /> Novo {titulo.replace(/s$/, '')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#001f3f] text-white">
            <tr>
              <th className="px-6 py-3 text-left font-semibold w-24">ID</th>
              <th className="px-6 py-3 text-left font-semibold">{labelColuna}</th>
              <th className="px-6 py-3 text-right font-semibold w-28">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                  Aguardando dados do banco...
                </td>
              </tr>
            ) : itens.map(item => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="px-6 py-3 font-mono text-gray-400 text-xs">{item.id}</td>
                <td className="px-6 py-3 font-medium text-gray-800">{item.descricao}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => abrirEditar(item)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition" title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteItem(item)} className="text-red-400 hover:text-red-600 hover:scale-110 transition" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editItem ? `Editar ${titulo.replace(/s$/, '')}` : `Novo ${titulo.replace(/s$/, '')}`}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                {labelColuna}
                <span className="text-red-500 font-bold ml-0.5">*</span>
                {' '}— {descricao.length}/{maxLengthDescricao}
              </label>
              <input
                type="text"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && salvar()}
                maxLength={maxLengthDescricao}
                autoFocus
                className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition"
              />
            </div>

            <p className="text-xs text-gray-400">
              <span className="text-red-500 font-bold">*</span> Campo obrigatório
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="px-5 py-2 bg-[#001f3f] text-white rounded-xl font-bold hover:bg-[#003d6b] transition text-sm"
              >
                {editItem ? 'Atualizar' : 'Salvar no Banco'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteItem && (
        <ConfirmModal
          mensagem={`Deseja excluir "${deleteItem.descricao}" do banco de dados?`}
          onConfirm={excluir}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  )
}
