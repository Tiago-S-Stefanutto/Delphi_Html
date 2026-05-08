import { useState, useMemo, useRef } from 'react'
import { Plus, Upload, Download, Search, Pencil, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Modal, ConfirmModal } from '@/components/Modal'
import type { Elemento, Grupo, Periodo, Familia, CategoriaQuimica, MsgParaDelphi } from '@/types'

interface ElementosProps {
  elementos: Elemento[]
  grupos: Grupo[]
  periodos: Periodo[]
  familias: Familia[]
  categorias: CategoriaQuimica[]
  enviar: (msg: MsgParaDelphi) => void
  onRefresh: () => void
}

interface Filtros {
  categoria: string
  numero: string
  simbolo: string
  nome: string
  grupo: string
  periodo: string
  familia: string
}

export function Elementos({ elementos, grupos, periodos, familias, categorias, enviar, onRefresh }: ElementosProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: '', numero: '', simbolo: '', nome: '', grupo: '', periodo: '', familia: ''
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Elemento | null>(null)
  const [deleteItem, setDeleteItem] = useState<Elemento | null>(null)

  // Form state
  const [form, setForm] = useState({
    numero_atomico: '', simbolo: '', nome: '', massa_atomica: '',
    grupo_id: '', periodo_id: '', familia_id: '', categoria_quimica_id: ''
  })

  const filtrados = useMemo(() => {
    return elementos.filter(el => {
      return (
        (!filtros.categoria || el.categoria_quimica === filtros.categoria) &&
        (!filtros.numero    || el.numero_atomico === filtros.numero) &&
        (!filtros.simbolo   || el.simbolo.toLowerCase().includes(filtros.simbolo.toLowerCase())) &&
        (!filtros.nome      || el.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
        (!filtros.grupo     || el.grupo === filtros.grupo) &&
        (!filtros.periodo   || el.periodo === filtros.periodo) &&
        (!filtros.familia   || el.familia === filtros.familia)
      )
    })
  }, [elementos, filtros])

  function abrirNovo() {
    setEditItem(null)
    setForm({ numero_atomico: '', simbolo: '', nome: '', massa_atomica: '', grupo_id: '', periodo_id: '', familia_id: '', categoria_quimica_id: '' })
    setModalOpen(true)
  }

  function abrirEditar(el: Elemento) {
    setEditItem(el)
    setForm({
      numero_atomico:    el.numero_atomico,
      simbolo:           el.simbolo,
      nome:              el.nome,
      massa_atomica:     el.massa_atomica,
      grupo_id:          grupos.find(g => g.descricao === el.grupo)?.grupoId ?? '',
      periodo_id:        periodos.find(p => p.descricao === el.periodo)?.periodoId ?? '',
      familia_id:        familias.find(f => f.descricao === el.familia)?.familiaId ?? '',
      categoria_quimica_id: categorias.find(c => c.descricao === el.categoria_quimica)?.categoria_quimicaId ?? '',
    })
    setModalOpen(true)
  }

  function salvar() {
    const base = {
      numero_atomico:       Number(form.numero_atomico),
      simbolo:              form.simbolo,
      nome:                 form.nome,
      massa_atomica:        parseFloat(form.massa_atomica),
      grupo_id:             Number(form.grupo_id),
      periodo_id:           Number(form.periodo_id),
      familia_id:           Number(form.familia_id),
      categoria_quimica_id: Number(form.categoria_quimica_id),
    }
    if (editItem) {
      enviar({ acao: 'atualizar', entidade: 'elemento', elementoId: Number(editItem.elementoId), ...base })
    } else {
      enviar({ acao: 'inserir', entidade: 'elemento', ...base })
    }
    setModalOpen(false)
    setTimeout(onRefresh, 400)
  }

  function excluir() {
    if (!deleteItem) return
    enviar({ acao: 'apagar', entidade: 'elemento', elementoId: Number(deleteItem.elementoId) })
    setDeleteItem(null)
    setTimeout(onRefresh, 400)
  }

  // Importação XLSX → envia ao Delphi
  function processarXLSX(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      enviar({ acao: 'importar', entidade: 'elemento', dados: rows })
      setTimeout(onRefresh, 600)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  // Exportação — envia os dados filtrados ao Delphi para ele criar o arquivo
  function exportarXML() {
    if (filtrados.length === 0) {
      alert('Nenhum elemento para exportar com os filtros atuais.')
      return
    }
    // Envia somente os registros visíveis na grid
    // O Delphi recebe em: aJSON.GetValue<TJSONArray>('registros')
    enviar({
      acao: 'exportar',
      entidade: 'elemento',
      registros: filtrados,
    })
  }

  const setF = (k: keyof Filtros) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFiltros(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="animate-fadeUp">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#001f3f] mb-1">⚛️ Elementos Químicos</h1>
          <p className="text-gray-500 text-sm">Gerencie os elementos da tabela periódica</p>
        </div>
        <div className="flex gap-3">
          <input type="file" ref={fileRef} className="hidden" accept=".xlsx,.xls" onChange={processarXLSX} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-800 transition text-sm"
          >
            <Upload size={16} /> Importar XLSX
          </button>
          <button
            onClick={exportarXML}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-800 transition text-sm"
          >
            <Download size={16} /> Exportar XML
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Categoria</label>
          <select value={filtros.categoria} onChange={setF('categoria')} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20">
            <option value="">Todas</option>
            {categorias.map(c => <option key={c.categoria_quimicaId} value={c.descricao}>{c.descricao}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Nº Atômico</label>
          <input type="number" value={filtros.numero} onChange={setF('numero')} placeholder="Ex: 1" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Símbolo</label>
          <input type="text" value={filtros.simbolo} onChange={setF('simbolo')} placeholder="Ex: H" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Nome</label>
          <input type="text" value={filtros.nome} onChange={setF('nome')} placeholder="Ex: Hidrogênio" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Grupo</label>
          <select value={filtros.grupo} onChange={setF('grupo')} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20">
            <option value="">Todos</option>
            {grupos.map(g => <option key={g.grupoId} value={g.descricao}>{g.descricao}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Período</label>
          <select value={filtros.periodo} onChange={setF('periodo')} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20">
            <option value="">Todos</option>
            {periodos.map(p => <option key={p.periodoId} value={p.descricao}>{p.descricao}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Família</label>
          <select value={filtros.familia} onChange={setF('familia')} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20">
            <option value="">Todas</option>
            {familias.map(f => <option key={f.familiaId} value={f.descricao}>{f.descricao}</option>)}
          </select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Search size={14} /> {filtrados.length} de {elementos.length} elemento(s)
        </p>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-[#001f3f] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#003d6b] transition text-sm"
        >
          <Plus size={16} /> Novo Elemento
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#001f3f] text-white">
            <tr>
              {['Nº', 'Símbolo', 'Nome', 'Massa', 'Grupo', 'Período', 'Família', 'Categoria', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400 italic">
                  {elementos.length === 0 ? 'Aguardando dados do banco...' : 'Nenhum resultado para os filtros.'}
                </td>
              </tr>
            ) : filtrados.map(el => (
              <tr key={el.elementoId} className="border-b border-gray-50">
                <td className="px-4 py-3 font-mono text-gray-500">{el.numero_atomico}</td>
                <td className="px-4 py-3 font-bold text-[#001f3f] text-base">{el.simbolo}</td>
                <td className="px-4 py-3">{el.nome}</td>
                <td className="px-4 py-3 font-mono text-gray-500">{el.massa_atomica}</td>
                <td className="px-4 py-3">{el.grupo}</td>
                <td className="px-4 py-3">{el.periodo}</td>
                <td className="px-4 py-3">{el.familia}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-[#001f3f]/10 text-[#001f3f] rounded text-xs font-medium">
                    {el.categoria_quimica}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => abrirEditar(el)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition" title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteItem(el)} className="text-red-400 hover:text-red-600 hover:scale-110 transition" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <Modal title={editItem ? `Editar: ${editItem.nome}` : 'Novo Elemento'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Nº Atômico *</label>
                <input type="number" min={1} max={999} value={form.numero_atomico} onChange={e => setForm(p => ({...p, numero_atomico: e.target.value}))}
                  className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  Símbolo * — {form.simbolo.length}/5
                </label>
                <input type="text" value={form.simbolo} maxLength={5} onChange={e => setForm(p => ({...p, simbolo: e.target.value}))}
                  className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                Nome * — {form.nome.length}/50
              </label>
              <input type="text" value={form.nome} maxLength={50} onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Massa Atômica — DECIMAL(10,4)</label>
              <input type="number" step="0.0001" min={0} value={form.massa_atomica} onChange={e => setForm(p => ({...p, massa_atomica: e.target.value}))}
                className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Grupo *</label>
                <select value={form.grupo_id} onChange={e => setForm(p => ({...p, grupo_id: e.target.value}))}
                  className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition bg-white">
                  <option value="">Selecione...</option>
                  {grupos.map(g => <option key={g.grupoId} value={g.grupoId}>{g.descricao}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Período *</label>
                <select value={form.periodo_id} onChange={e => setForm(p => ({...p, periodo_id: e.target.value}))}
                  className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition bg-white">
                  <option value="">Selecione...</option>
                  {periodos.map(p => <option key={p.periodoId} value={p.periodoId}>{p.descricao}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Família</label>
              <select value={form.familia_id} onChange={e => setForm(p => ({...p, familia_id: e.target.value}))}
                className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition bg-white">
                <option value="">Selecione...</option>
                {familias.map(f => <option key={f.familiaId} value={f.familiaId}>{f.descricao}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Categoria Química</label>
              <select value={form.categoria_quimica_id} onChange={e => setForm(p => ({...p, categoria_quimica_id: e.target.value}))}
                className="w-full border-b-2 border-gray-200 focus:border-[#001f3f] p-2 outline-none text-sm transition bg-white">
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.categoria_quimicaId} value={c.categoria_quimicaId}>{c.descricao}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">
                Cancelar
              </button>
              <button onClick={salvar} className="px-5 py-2 bg-[#001f3f] text-white rounded-xl font-bold hover:bg-[#003d6b] transition text-sm">
                {editItem ? 'Atualizar' : 'Salvar no Banco'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {deleteItem && (
        <ConfirmModal
          mensagem={`Deseja excluir "${deleteItem.nome}" do banco de dados?`}
          onConfirm={excluir}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  )
}
