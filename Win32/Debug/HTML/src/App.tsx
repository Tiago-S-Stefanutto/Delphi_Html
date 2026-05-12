import { useState, useCallback } from 'react'
import { Welcome } from '@/components/Welcome'
import { Navbar } from '@/components/Navbar'
import { Elementos } from '@/pages/Elementos'
import { CrudSimples } from '@/pages/CrudSimples'
import { ToastContainer } from '@/components/Toast'
import type { ToastData } from '@/components/Toast'
import { useDelphi, emptyStore } from '@/hooks/useDelphi'
import type {
  DataStore, Elemento, Grupo, Periodo, Familia, CategoriaQuimica,
  MsgParaDelphi
} from '@/types'

type Screen = 'elemento' | 'grupo' | 'periodo' | 'familia' | 'categoria_quimica'

let toastSeq = 0

export default function App() {
  const [tela, setTela] = useState<'welcome' | Screen>('welcome')
  const [store, setStore] = useState<DataStore>(emptyStore)
  const [toasts, setToasts] = useState<ToastData[]>([])

  // ───────────────── Toast helpers ─────────────────
  const addToast = useCallback((tipo: 'ok' | 'erro', msg: string) => {
    setToasts(t => [...t, { id: ++toastSeq, tipo, msg }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  // ───────────────── Dados vindos do Delphi ─────────────────
  const onDados = useCallback(
    (entidade: string, registros: Record<string, string>[]) => {
      setStore(prev => {
        const next = { ...prev }

        switch (entidade) {
          case 'elemento':
            next.elemento = registros as unknown as Elemento[]
            break

          case 'grupo':
            next.grupo = registros as unknown as Grupo[]
            break

          case 'periodo':
            next.periodo = registros as unknown as Periodo[]
            break

          case 'familia':
            next.familia = registros as unknown as Familia[]
            break

          case 'categoria_quimica':
            next.categoria_quimica =
              registros as unknown as CategoriaQuimica[]
            break
        }

        return next
      })
    },
    []
  )

  // ───────────────── Respostas Delphi ─────────────────
  const onResposta = useCallback(
    (acao: 'ok' | 'erro', msg: string) => {
      addToast(
        acao,
        msg || (acao === 'ok'
          ? 'Operação realizada!'
          : 'Erro na operação.')
      )
    },
    [addToast]
  )

  const { enviar, listar } = useDelphi(onDados, onResposta)

  // ───────────────── Envio tipado ─────────────────
  const send = useCallback(
    (msg: MsgParaDelphi) => enviar(msg),
    [enviar]
  )

  // ───────────────── Navegação ─────────────────
  function navegarPara(screen: Screen) {
    setTela(screen)

    listar(screen)

    if (screen === 'elemento') {
      listar('grupo')
      listar('periodo')
      listar('familia')
      listar('categoria_quimica')
    }
  }

  function entrar() {
    setTela('elemento')

    ;([
      'elemento',
      'grupo',
      'periodo',
      'familia',
      'categoria_quimica'
    ] as const).forEach(e => listar(e))
  }

  function sair() {
    enviar({ acao: 'Fechar' })
  }

  // ───────────────── Refresh ─────────────────
  function refresh() {
    if (tela !== 'welcome')
      listar(tela as string)

    if (tela === 'elemento') {
      listar('grupo')
      listar('periodo')
      listar('familia')
      listar('categoria_quimica')
    }
  }

  // ───────────────── Conversão simples ─────────────────
  const gruposSimples = store.grupo.map(g => ({
    id: g.grupoId,
    descricao: g.descricao
  }))

  const periodosSimples = store.periodo.map(p => ({
    id: p.periodoId,
    descricao: p.descricao
  }))

  const familiasSimples = store.familia.map(f => ({
    id: f.familiaId,
    descricao: f.descricao
  }))

  const catSimples = store.categoria_quimica.map(c => ({
    id: c.categoria_quimicaId,
    descricao: c.descricao
  }))

  // ───────────────── Render ─────────────────
  if (tela === 'welcome') {
    return (
      <>
        <Welcome onEntrar={entrar} />
        <ToastContainer
          toasts={toasts}
          remove={removeToast}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      <Navbar
        current={tela}
        onChange={navegarPara}
        onSair={sair}
      />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {tela === 'elemento' && (
          <Elementos
            elementos={store.elemento}
            grupos={store.grupo}
            periodos={store.periodo}
            familias={store.familia}
            categorias={store.categoria_quimica}
            enviar={send}
            onRefresh={refresh}
          />
        )}

        {tela === 'grupo' && (
          <CrudSimples
            titulo="Grupos"
            icone="📋"
            subtitulo="Gerencie as colunas verticais da tabela periódica"
            entidade="grupo"
            idField="grupoId"
            labelColuna="Descrição (Número / Nome)"
            maxLengthDescricao={5}
            itens={gruposSimples}
            enviar={send}
            onRefresh={refresh}
          />
        )}

        {tela === 'periodo' && (
          <CrudSimples
            titulo="Períodos"
            icone="📈"
            subtitulo="Gerencie as linhas horizontais da tabela periódica"
            entidade="periodo"
            idField="periodoId"
            labelColuna="Descrição (Número da Linha)"
            maxLengthDescricao={5}
            itens={periodosSimples}
            enviar={send}
            onRefresh={refresh}
          />
        )}

        {tela === 'familia' && (
          <CrudSimples
            titulo="Famílias"
            icone="👨‍👩‍👧‍👦"
            subtitulo="Gerencie as famílias de elementos"
            entidade="familia"
            idField="familiaId"
            labelColuna="Nome da Família"
            maxLengthDescricao={50}
            itens={familiasSimples}
            enviar={send}
            onRefresh={refresh}
          />
        )}

        {tela === 'categoria_quimica' && (
          <CrudSimples
            titulo="Categorias Químicas"
            icone="🏷️"
            subtitulo="Gerencie os tipos gerais de elementos"
            entidade="categoria_quimica"
            idField="categoria_quimicaId"
            labelColuna="Nome da Categoria"
            maxLengthDescricao={50}
            itens={catSimples}
            enviar={send}
            onRefresh={refresh}
          />
        )}
      </main>

      <ToastContainer
        toasts={toasts}
        remove={removeToast}
      />
    </div>
  )
}