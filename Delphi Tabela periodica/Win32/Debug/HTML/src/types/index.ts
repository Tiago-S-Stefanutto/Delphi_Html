// Tipos que espelham as entidades do Delphi/SQL

export interface Elemento {
  elementoId: string;
  numero_atomico: string;
  simbolo: string;
  nome: string;
  massa_atomica: string;
  grupo: string;       // descrição vinda do JOIN
  periodo: string;     // descrição vinda do JOIN
  familia: string;     // descrição vinda do JOIN
  categoria_quimica: string; // descrição vinda do JOIN
}

export interface Grupo {
  grupoId: string;
  descricao: string;
}

export interface Periodo {
  periodoId: string;
  descricao: string;
}

export interface Familia {
  familiaId: string;
  descricao: string;
}

export interface CategoriaQuimica {
  categoria_quimicaId: string;
  descricao: string;
}

// Mensagem recebida do Delphi via window.receberDelphi(jsonString)
export interface MsgDelphi {
  acao: 'dados' | 'ok' | 'erro';
  entidade?: string;
  registros?: Record<string, string>[];
  msg?: string;
}

// Mensagem enviada ao Delphi via chrome.webview.postMessage
export interface MsgParaDelphi {
  acao: string;         // listar | inserir | atualizar | apagar | importar | Fechar
  entidade?: string;
  [key: string]: unknown;
}

export type Entidade = 'elemento' | 'grupo' | 'periodo' | 'familia' | 'categoria_quimica';

export interface DataStore {
  elemento: Elemento[];
  grupo: Grupo[];
  periodo: Periodo[];
  familia: Familia[];
  categoria_quimica: CategoriaQuimica[];
}
