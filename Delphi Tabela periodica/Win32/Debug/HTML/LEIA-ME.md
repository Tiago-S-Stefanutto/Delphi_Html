# Sistema de Química - Frontend React

## Como rodar

1. Abra um terminal dentro desta pasta `HTML`
2. Execute: `npm install`
3. Execute: `npm run dev`
4. Acesse: http://localhost:5173

O Delphi já inicia o `npm run dev` automaticamente via `CreateProcess`.

---

## Integração com Delphi (IMPORTANTE)

### O que o Delphi precisa fazer

O `WVBrowser1WebMessageReceived` recebe mensagens do React via `postMessage`.
O conteúdo de `TempArgs.WebMessageAsString` será um **JSON string** como:

```
{"acao":"listar","entidade":"elemento"}
{"acao":"inserir","entidade":"grupo","descricao":"Grupo 1"}
{"acao":"atualizar","entidade":"elemento","elementoId":1,...}
{"acao":"apagar","entidade":"grupo","grupoId":5}
{"acao":"importar","entidade":"elemento","dados":[...]}
```

### Código correto para o WVBrowser1WebMessageReceived

```delphi
procedure TfrmPrincipal.WVBrowser1WebMessageReceived(Sender: TObject;
  const aWebView: ICoreWebView2;
  const aArgs: ICoreWebView2WebMessageReceivedEventArgs);
var
  TempArgs: TCoreWebView2WebMessageReceivedEventArgs;
  Mensagem: wvstring;
  oJSON: TJSONObject;
begin
  TempArgs := TCoreWebView2WebMessageReceivedEventArgs.Create(aArgs);
  try
    Mensagem := TempArgs.WebMessageAsString;
    oJSON := TJSONObject.ParseJSONValue(Mensagem) as TJSONObject;
    if Assigned(oJSON) then
    try
      ExecutarAcao(oJSON);
    finally
      oJSON.Free;
    end;
  finally
    FreeAndNil(TempArgs);
  end;
end;
```

### Como o React recebe dados do Delphi

O Delphi chama `EnviarParaHTML` que executa:
```
window.receberDelphi(<json_string>)
```

O React já tem `window.receberDelphi` registrado e processa automaticamente.

### Fluxo completo

```
React inicia → envia listar para cada entidade
Delphi recebe → faz query → chama EnviarParaHTML
React recebe via receberDelphi → atualiza a tela
```

---

## Estrutura do projeto

```
HTML/
├── src/
│   ├── App.tsx              ← raiz, orquestra tudo
│   ├── hooks/useDelphi.ts   ← bridge React ↔ Delphi
│   ├── types/index.ts       ← interfaces TypeScript
│   ├── components/
│   │   ├── Welcome.tsx
│   │   ├── Navbar.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   └── pages/
│       ├── Elementos.tsx    ← CRUD completo + filtros + XLSX + XML
│       └── CrudSimples.tsx  ← usado por Grupos/Períodos/Famílias/Categorias
├── index.html
├── package.json
└── vite.config.ts
```
