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

interface FormState {
  numero_atomico: string
  simbolo: string
  nome: string
  massa_atomica: string
  grupo_id: string
  periodo_id: string
  familia_id: string
  categoria_quimica_id: string
}

const FORM_VAZIO: FormState = {
  numero_atomico: '', simbolo: '', nome: '', massa_atomica: '',
  grupo_id: '', periodo_id: '', familia_id: '', categoria_quimica_id: '',
}

// Label com asterisco vermelho opcional
function Label({ children, required, extra }: {
  children: React.ReactNode
  required?: boolean
  extra?: string
}) {
  return (
    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
      {children}
      {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
      {extra && <span className="normal-case font-normal ml-1 text-gray-400">— {extra}</span>}
    </label>
  )
}

export function Elementos({
  elementos, grupos, periodos, familias, categorias, enviar, onRefresh
}: ElementosProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [filtros, setFiltros] = useState<Filtros>({
    categoria: '', numero: '', simbolo: '', nome: '', grupo: '', periodo: '', familia: '',
  })

  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<Elemento | null>(null)
  const [deleteItem, setDeleteItem] = useState<Elemento | null>(null)
  const [form, setForm]             = useState<FormState>(FORM_VAZIO)
  const [erros, setErros]           = useState<Partial<Record<keyof FormState, string>>>({})

  // ─── Filtro ────────────────────────────────────────────────────────
  const filtrados = useMemo(() => elementos.filter(el => (
    (!filtros.categoria || el.categoria_quimica === filtros.categoria) &&
    (!filtros.numero    || el.numero_atomico    === filtros.numero) &&
    (!filtros.simbolo   || el.simbolo.toLowerCase().includes(filtros.simbolo.toLowerCase())) &&
    (!filtros.nome      || el.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
    (!filtros.grupo     || el.grupo    === filtros.grupo) &&
    (!filtros.periodo   || el.periodo  === filtros.periodo) &&
    (!filtros.familia   || el.familia  === filtros.familia)
  )), [elementos, filtros])

  const setF = (k: keyof Filtros) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFiltros(prev => ({ ...prev, [k]: e.target.value }))

  // ─── Abrir modais ──────────────────────────────────────────────────
  function abrirNovo() {
    setEditItem(null)
    setForm(FORM_VAZIO)
    setErros({})
    setModalOpen(true)
  }

  function abrirEditar(el: Elemento) {
    setEditItem(el)
    setForm({
      numero_atomico:       el.numero_atomico,
      simbolo:              el.simbolo,
      nome:                 el.nome,
      massa_atomica:        el.massa_atomica,
      grupo_id:             grupos.find(g => g.descricao === el.grupo)?.grupoId ?? '',
      periodo_id:           periodos.find(p => p.descricao === el.periodo)?.periodoId ?? '',
      familia_id:           familias.find(f => f.descricao === el.familia)?.familiaId ?? '',
      categoria_quimica_id: categorias.find(c => c.descricao === el.categoria_quimica)?.categoria_quimicaId ?? '',
    })
    setErros({})
    setModalOpen(true)
  }

  // ─── Validação ─────────────────────────────────────────────────────
  function validar(): boolean {
    const novosErros: Partial<Record<keyof FormState, string>> = {}

    const num = Number(form.numero_atomico)
    if (!form.numero_atomico.trim())       novosErros.numero_atomico = 'Obrigatório'
    else if (isNaN(num) || num < 1)        novosErros.numero_atomico = 'Deve ser ≥ 1'

    if (!form.simbolo.trim())              novosErros.simbolo   = 'Obrigatório'
    if (!form.nome.trim())                 novosErros.nome      = 'Obrigatório'

    if (form.massa_atomica.trim() !== '') {
      const massa = parseFloat(form.massa_atomica)
      if (isNaN(massa) || massa < 0)       novosErros.massa_atomica = 'Valor inválido'
      else if (massa > 999999.9999)        novosErros.massa_atomica = 'Máx: 999999.9999'
    }

    if (!form.grupo_id)                    novosErros.grupo_id    = 'Obrigatório'
    if (!form.periodo_id)                  novosErros.periodo_id  = 'Obrigatório'

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  // ─── Salvar ────────────────────────────────────────────────────────
  function salvar() {
    if (!validar()) return

    // Campos numéricos: só envia valor se não estiver vazio
    const massaFinal = form.massa_atomica.trim() !== ''
      ? parseFloat(form.massa_atomica)
      : 0

    // IDs opcionais: 0 indica "não informado" ao Delphi (ajuste conforme sua lógica)
    const base = {
      numero_atomico:       Number(form.numero_atomico),
      simbolo:              form.simbolo.trim(),
      nome:                 form.nome.trim(),
      massa_atomica:        massaFinal,
      grupo_id:             Number(form.grupo_id),
      periodo_id:           Number(form.periodo_id),
      familia_id:           form.familia_id           ? Number(form.familia_id)           : 0,
      categoria_quimica_id: form.categoria_quimica_id ? Number(form.categoria_quimica_id) : 0,
    }

    if (editItem) {
      enviar({ acao: 'atualizar', entidade: 'elemento', elementoId: Number(editItem.elementoId), ...base })
    } else {
      enviar({ acao: 'inserir', entidade: 'elemento', ...base })
    }

    setModalOpen(false)
    setTimeout(onRefresh, 400)
  }

  // ─── Excluir ───────────────────────────────────────────────────────
  function excluir() {
    if (!deleteItem) return
    enviar({ acao: 'apagar', entidade: 'elemento', elementoId: Number(deleteItem.elementoId) })
    setDeleteItem(null)
    setTimeout(onRefresh, 400)
  }

  // ─── XLSX ──────────────────────────────────────────────────────────
  function processarXLSX(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer)
      const wb   = XLSX.read(data, { type: 'array' })
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      enviar({ acao: 'importar', entidade: 'elemento', dados: rows })
      setTimeout(onRefresh, 600)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  function exportarXML() {
    if (filtrados.length === 0) {
      alert('Nenhum elemento para exportar com os filtros atuais.')
      return
    }
    enviar({ acao: 'exportar', entidade: 'elemento', registros: filtrados })
  }

  // ─── Helpers de estilo ─────────────────────────────────────────────
  const inputCls  = (campo: keyof FormState) =>
    `w-full border-b-2 p-2 outline-none text-sm transition bg-transparent ${
      erros[campo] ? 'border-red-400' : 'border-gray-200 focus:border-[#001f3f]'
    }`
  const selectCls = (campo: keyof FormState) =>
    `w-full border-b-2 p-2 outline-none text-sm transition bg-white ${
      erros[campo] ? 'border-red-400' : 'border-gray-200 focus:border-[#001f3f]'
    }`

  function ErrMsg({ campo }: { campo: keyof FormState }) {
    return erros[campo]
      ? <span className="text-red-500 text-xs mt-0.5 block">{erros[campo]}</span>
      : null
  }

  // ─── Render ────────────────────────────────────────────────────────
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
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-800 transition text-sm">
            <Upload size={16} /> Importar XLSX
          </button>
          <button onClick={exportarXML}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-800 transition text-sm">
            <Download size={16} /> Exportar XML
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Categoria', key: 'categoria', tipo: 'select',
            opts: [{ v: '', l: 'Todas' }, ...categorias.map(c => ({ v: c.descricao, l: c.descricao }))] },
          { label: 'Nº Atômico', key: 'numero', tipo: 'input', ph: 'Ex: 1', inputType: 'number' },
          { label: 'Símbolo',    key: 'simbolo', tipo: 'input', ph: 'Ex: H' },
          { label: 'Nome',       key: 'nome',    tipo: 'input', ph: 'Ex: Hidrogênio' },
          { label: 'Grupo',   key: 'grupo',   tipo: 'select',
            opts: [{ v: '', l: 'Todos' }, ...grupos.map(g => ({ v: g.descricao, l: g.descricao }))] },
          { label: 'Período', key: 'periodo', tipo: 'select',
            opts: [{ v: '', l: 'Todos' }, ...periodos.map(p => ({ v: p.descricao, l: p.descricao }))] },
          { label: 'Família', key: 'familia', tipo: 'select',
            opts: [{ v: '', l: 'Todas' }, ...familias.map(f => ({ v: f.descricao, l: f.descricao }))] },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">{f.label}</label>
            {f.tipo === 'select' ? (
              <select value={filtros[f.key as keyof Filtros]} onChange={setF(f.key as keyof Filtros)}
                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20">
                {f.opts!.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ) : (
              <input type={f.inputType ?? 'text'} value={filtros[f.key as keyof Filtros]}
                onChange={setF(f.key as keyof Filtros)} placeholder={f.ph}
                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20" />
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Search size={14} /> {filtrados.length} de {elementos.length} elemento(s)
        </p>
        <button onClick={abrirNovo}
          className="flex items-center gap-2 bg-[#001f3f] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#003d6b] transition text-sm">
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
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 italic">
                {elementos.length === 0 ? 'Aguardando dados do banco...' : 'Nenhum resultado para os filtros.'}
              </td></tr>
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
          <div className="space-y-5">

            {/* Nº Atômico + Símbolo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Nº Atômico</Label>
                <input type="number" min={1} max={999}
                  value={form.numero_atomico}
                  onChange={e => { setForm(p => ({ ...p, numero_atomico: e.target.value })); setErros(p => ({ ...p, numero_atomico: undefined })) }}
                  className={inputCls('numero_atomico')} />
                <ErrMsg campo="numero_atomico" />
              </div>
              <div>
                <Label required extra={`${form.simbolo.length}/5`}>Símbolo</Label>
                <input type="text" maxLength={5}
                  value={form.simbolo}
                  onChange={e => { setForm(p => ({ ...p, simbolo: e.target.value })); setErros(p => ({ ...p, simbolo: undefined })) }}
                  className={inputCls('simbolo')} />
                <ErrMsg campo="simbolo" />
              </div>
            </div>

            {/* Nome */}
            <div>
              <Label required extra={`${form.nome.length}/50`}>Nome</Label>
              <input type="text" maxLength={50}
                value={form.nome}
                onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setErros(p => ({ ...p, nome: undefined })) }}
                className={inputCls('nome')} />
              <ErrMsg campo="nome" />
            </div>

            {/* Massa Atômica */}
            <div>
              <Label extra="DECIMAL(10,4) — máx: 999999.9999">Massa Atômica</Label>
              <input type="text" placeholder="0.0000"
                value={form.massa_atomica}
                onChange={e => {
                  let v = e.target.value.replace(/[^0-9.]/g, '')
                  const pts = v.split('.')
                  if (pts.length > 2) v = pts[0] + '.' + pts.slice(1).join('')
                  if (v.includes('.')) {
                    const [int, dec] = v.split('.')
                    if (int.length > 6 || dec.length > 4) return
                  } else if (v.length > 6) return
                  setForm(p => ({ ...p, massa_atomica: v }))
                  setErros(p => ({ ...p, massa_atomica: undefined }))
                }}
                className={inputCls('massa_atomica')} />
              <ErrMsg campo="massa_atomica" />
            </div>

            {/* Grupo + Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Grupo</Label>
                <select value={form.grupo_id}
                  onChange={e => { setForm(p => ({ ...p, grupo_id: e.target.value })); setErros(p => ({ ...p, grupo_id: undefined })) }}
                  className={selectCls('grupo_id')}>
                  <option value="">Selecione...</option>
                  {grupos.map(g => <option key={g.grupoId} value={g.grupoId}>{g.descricao}</option>)}
                </select>
                <ErrMsg campo="grupo_id" />
              </div>
              <div>
                <Label required>Período</Label>
                <select value={form.periodo_id}
                  onChange={e => { setForm(p => ({ ...p, periodo_id: e.target.value })); setErros(p => ({ ...p, periodo_id: undefined })) }}
                  className={selectCls('periodo_id')}>
                  <option value="">Selecione...</option>
                  {periodos.map(p => <option key={p.periodoId} value={p.periodoId}>{p.descricao}</option>)}
                </select>
                <ErrMsg campo="periodo_id" />
              </div>
            </div>

            {/* Família */}
            <div>
              <Label>Família</Label>
              <select value={form.familia_id}
                onChange={e => setForm(p => ({ ...p, familia_id: e.target.value }))}
                className={selectCls('familia_id')}>
                <option value="">Selecione...</option>
                {familias.map(f => <option key={f.familiaId} value={f.familiaId}>{f.descricao}</option>)}
              </select>
            </div>

            {/* Categoria Química */}
            <div>
              <Label>Categoria Química</Label>
              <select value={form.categoria_quimica_id}
                onChange={e => setForm(p => ({ ...p, categoria_quimica_id: e.target.value }))}
                className={selectCls('categoria_quimica_id')}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.categoria_quimicaId} value={c.categoria_quimicaId}>{c.descricao}</option>)}
              </select>
            </div>

            {/* Legenda + botões */}
            <p className="text-xs text-gray-400">
              <span className="text-red-500 font-bold">*</span> Campos obrigatórios
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)}
                className="px-5 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">
                Cancelar
              </button>
              <button onClick={salvar}
                className="px-5 py-2 bg-[#001f3f] text-white rounded-xl font-bold hover:bg-[#003d6b] transition text-sm">
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
