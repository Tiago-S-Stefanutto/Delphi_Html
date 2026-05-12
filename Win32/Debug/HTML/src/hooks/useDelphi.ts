import { useEffect, useRef, useCallback } from 'react'
import type { MsgParaDelphi, DataStore } from '@/types'

type OnDadosCallback = (
  entidade: string,
  registros: Record<string, any>[]
) => void

type OnRespostaCallback = (
  acao: 'ok' | 'erro',
  msg: string
) => void

interface UseDelphi {
  enviar: (msg: MsgParaDelphi) => void
  listar: (entidade: string) => void
}

function isWebView2(): boolean {
  return !!(window as any)?.chrome?.webview
}

function getWebView(): any {
  return (window as any).chrome.webview
}

export function useDelphi(
  onDados: OnDadosCallback,
  onResposta: OnRespostaCallback
): UseDelphi {

  const onDadosRef = useRef(onDados)
  const onRespostaRef = useRef(onResposta)

  useEffect(() => {
    onDadosRef.current = onDados
  }, [onDados])

  useEffect(() => {
    onRespostaRef.current = onResposta
  }, [onResposta])

  useEffect(() => {

    ;(window as any).receberDelphi = (jsonStr: string) => {
      try {

        if (!jsonStr || typeof jsonStr !== 'string') {
          console.error('[Delphi Bridge] Mensagem inválida:', jsonStr)
          return
        }

        const msg = JSON.parse(jsonStr)

        console.log('[Delphi -> React]', msg)

        // =========================
        // NOVO PADRÃO DO DELPHI
        // =========================
        if (msg.sucesso === true && msg.entidade && Array.isArray(msg.dados)) {
          onDadosRef.current(msg.entidade, msg.dados)
          return
        }

        // =========================
        // RESPOSTAS DE SUCESSO
        // =========================
        if (msg.sucesso === true) {
          onRespostaRef.current(
            'ok',
            msg.mensagem ?? 'Operação realizada com sucesso.'
          )
          return
        }

        // =========================
        // RESPOSTAS DE ERRO
        // =========================
        if (msg.sucesso === false) {
          onRespostaRef.current(
            'erro',
            msg.mensagem ?? 'Erro na operação.'
          )
          return
        }

        // =========================
        // COMPATIBILIDADE ANTIGA
        // =========================
        if (
          msg.acao === 'dados' &&
          msg.entidade &&
          Array.isArray(msg.registros)
        ) {
          onDadosRef.current(msg.entidade, msg.registros)
          return
        }

        if (msg.acao === 'ok' || msg.acao === 'erro') {
          onRespostaRef.current(
            msg.acao,
            msg.msg ?? ''
          )
          return
        }

        console.warn('[Delphi Bridge] Mensagem desconhecida:', msg)

      } catch (e) {
        console.error(
          '[Delphi Bridge] Erro ao processar JSON:',
          jsonStr,
          e
        )
      }
    }

    return () => {
      delete (window as any).receberDelphi
    }

  }, [])

  const enviar = useCallback((msg: MsgParaDelphi) => {

    try {

      const json = JSON.stringify(msg)

      console.log('[React -> Delphi]', json)

      if (isWebView2()) {
        getWebView().postMessage(json)
      } else {
        console.log('[DEV MODE]', json)
      }

    } catch (e) {
      console.error('[React -> Delphi] Erro ao enviar mensagem:', e)
    }

  }, [])

  const listar = useCallback((entidade: string) => {
    enviar({
      acao: 'listar',
      entidade
    })
  }, [enviar])

  return {
    enviar,
    listar
  }
}

export function emptyStore(): DataStore {
  return {
    elemento: [],
    grupo: [],
    periodo: [],
    familia: [],
    categoria_quimica: [],
  }
}