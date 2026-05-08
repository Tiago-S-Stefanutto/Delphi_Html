import { useEffect, useRef, useCallback } from 'react'
import type { MsgParaDelphi, DataStore } from '@/types'

type OnDadosCallback    = (entidade: string, registros: Record<string, string>[]) => void
type OnRespostaCallback = (acao: 'ok' | 'erro', msg: string) => void

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
  const onDadosRef    = useRef(onDados)
  const onRespostaRef = useRef(onResposta)
  onDadosRef.current    = onDados
  onRespostaRef.current = onResposta

  useEffect(() => {
    // O Delphi chama: WVBrowser1.ExecuteScript('window.receberDelphi(' + oStr.ToJSON + ')')
    // oStr é TJSONString → ToJSON coloca o JSON entre aspas como string JS
    // Então receberDelphi recebe uma STRING com o JSON puro dentro
    ;(window as any).receberDelphi = (jsonStr: string) => {
      try {
        const msg = JSON.parse(jsonStr)
        if (msg.acao === 'dados' && msg.entidade && Array.isArray(msg.registros)) {
          onDadosRef.current(msg.entidade, msg.registros)
        } else if (msg.acao === 'ok' || msg.acao === 'erro') {
          onRespostaRef.current(msg.acao, msg.msg ?? '')
        }
      } catch (e) {
        console.error('[Delphi Bridge] JSON invalido:', jsonStr, e)
      }
    }
    return () => { delete (window as any).receberDelphi }
  }, [])

  // O Delphi recebe via WVBrowser1WebMessageReceived -> TempArgs.WebMessageAsString
  // postMessage do WebView2 espera uma STRING
  const enviar = useCallback((msg: MsgParaDelphi) => {
    const json = JSON.stringify(msg)
    if (isWebView2()) {
      getWebView().postMessage(json)
    } else {
      console.log('[DEV -> Delphi]', json)
    }
  }, [])

  const listar = useCallback((entidade: string) => {
    enviar({ acao: 'listar', entidade })
  }, [enviar])

  return { enviar, listar }
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
