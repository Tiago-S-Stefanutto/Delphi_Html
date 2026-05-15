# 🧪 Projeto Química

Sistema desktop desenvolvido em **Delphi VCL + React + WebView2 + SQL Server** para gerenciamento de elementos químicos, utilizando integração híbrida entre frontend web moderno e aplicação desktop nativa.

---

# 📚 Visão Geral

O sistema utiliza:

| Tecnologia | Função |
|---|---|
| Delphi VCL | Backend/Desktop |
| React 19 | Interface Web |
| Vite | Servidor frontend |
| WebView2 | Renderização do frontend dentro do Delphi |
| SQL Server | Banco de dados |
| FireDAC | Conexão com banco |
| TypeScript | Frontend |
| TailwindCSS | Estilização |
| XLSX | Importação de planilhas |
| XML | Exportação de dados |

---

# 🚀 Funcionalidades

- ✅ Cadastro de elementos químicos
- ✅ Cadastro de grupos
- ✅ Cadastro de períodos
- ✅ Cadastro de famílias
- ✅ Cadastro de categorias químicas
- ✅ CRUD completo
- ✅ Importação XLSX
- ✅ Exportação XML
- ✅ Integração Delphi ↔ React
- ✅ Atualização automática do banco
- ✅ Comunicação JSON entre frontend e backend

---

# 🏗 Arquitetura do Sistema

```txt
Delphi VCL
   ↓
WebView2
   ↓
React + Vite
   ↓
JSON Messaging
   ↓
FireDAC
   ↓
SQL Server
```

---

# 📂 Estrutura do Projeto

```txt
ProjetoQuimica/
│
├── Win32/
│   └── Debug/
│       ├── HTML/
│       ├── ProjectQuimica.exe
│       ├── ProjectQuimica.ini
│       └── arquivos XML exportados
│
├── Source/
├── Units/
└── Banco/
```

---

# ⚙️ Requisitos

## Sistema Operacional

- Windows 10 ou superior

## Softwares Necessários

- Delphi 10.2 Tokyo ou superior
- Node.js 20 LTS ou superior
- SQL Server Express 2014 with Tools ou superior
- Microsoft Edge WebView2 Runtime

---

# 📦 Instalação dos Pacotes WebView4Delphi no Delphi

> ⚠️ **Esta etapa é obrigatória antes de compilar o projeto.**
> Sem os pacotes WebView4Delphi instalados corretamente no Delphi IDE, o projeto não compilará.

O projeto utiliza o componente **WebView4Delphi** para renderizar o frontend React dentro da aplicação Delphi. São necessários dois pacotes: o **RTL** (runtime) e o **designtime** (design).

---

## 📁 Localização dos Pacotes

Os arquivos de pacote estão dentro da pasta do projeto:

```txt
Componentes\WebView4Delphi-main\WebView4Delphi-main\packages\
```

---

## Passo 1 — Compilar o pacote Runtime (WebView4DelphiVCLRTL)

Este pacote contém os componentes em tempo de execução e **deve ser compilado antes do designtime**.

1. Abra o Delphi IDE
2. Vá em **File → Open**
3. Navegue até:
   ```txt
   Componentes\WebView4Delphi-main\WebView4Delphi-main\packages\
   ```
4. Abra o arquivo:
   ```txt
   WebView4DelphiVCLRTL.dproj
   ```
5. No menu principal, clique em **Project → Build** (ou pressione `Shift+F9`)
6. Aguarde a compilação terminar sem erros

> ✅ Após compilar, o arquivo `WebView4DelphiVCLRTL.bpl` será gerado na pasta de saída do Delphi.

---

## Passo 2 — Compilar e Instalar o pacote Designtime (WebView4DelphiVCL_designtime)

Este pacote registra os componentes na paleta do Delphi IDE e **depende do pacote RTL** compilado no passo anterior.

1. No Delphi IDE, vá em **File → Open**
2. Navegue até:
   ```txt
   Componentes\WebView4Delphi-main\WebView4Delphi-main\packages\
   ```
3. Abra o arquivo:
   ```txt
   WebView4DelphiVCL_designtime.dproj
   ```
4. No menu principal, clique em **Project → Install**

   > O Delphi compilará e instalará o pacote automaticamente. O IDE pode ser reiniciado ou exibir uma mensagem confirmando o sucesso da instalação.

5. Confirme que os componentes aparecem na paleta do Delphi sob a aba **"WebView4Delphi"**:
   - `TWVBrowser`
   - `TWVWindowParent`

> ✅ Se ambos os componentes aparecerem na paleta, a instalação foi concluída com sucesso.

---

## ⚠️ Possíveis Erros na Instalação

| Erro | Solução |
|---|---|
| `Unit not found: uWVBrowser` | O pacote RTL não foi compilado. Repita o Passo 1. |
| `Package WebView4DelphiVCLRTL not found` | Adicione o caminho `packages\` ao Library Path do Delphi em **Tools → Options → Library**. |
| `Cannot load package` | Verifique se o WebView2 Runtime está instalado no sistema. |
| Componentes não aparecem na paleta | Tente **Component → Install Packages** e verifique se o `.bpl` está listado e ativo. |

---

## 🔧 Configurar o Library Path (se necessário)

Caso o Delphi não encontre as units do WebView4Delphi automaticamente:

1. Vá em **Tools → Options → Language → Delphi → Library**
2. Em **Library path**, clique no botão `...`
3. Adicione o caminho:
   ```txt
   Componentes\WebView4Delphi-main\WebView4Delphi-main\source
   ```
4. Clique em **OK**

---

# 📦 Instalação do Node.js

## Download

👉 https://nodejs.org

## Versão recomendada

```txt
Node.js 20 LTS ou superior
```

## Verificando instalação

Abra o CMD:

```bash
node -v
npm -v
```

Exemplo esperado:

```bash
v20.x.x
10.x.x
```

---

# 🗄 Instalação do SQL Server

## Versão utilizada no projeto

```txt
SQL Server 2014 Express with Tools
```

> Versões superiores também podem funcionar, porém o sistema foi desenvolvido e testado utilizando SQL Server 2014.

---

## Instalação

1. Baixe o SQL Server Express
2. https://www.microsoft.com/pt-br/download/details.aspx?id=42299&msockid=1a910f0b2ade69bc0d8c180d2ba16878
3. Execute:
```txt
SQLEXPRWT_x64_PTB.exe
```

3. Escolha:
```txt
Instalação Básica
```

4. Aguarde finalizar
5. Anote o nome da instância criada

---

## Exemplos de instância

```txt
.\SQLEXPRESS
.\SERVERCURSO
localhost
```

---

# 🛠 Configuração do Banco

Abra o **SSMS** e execute:

```sql
CREATE DATABASE Quimica;
GO

USE Quimica;
GO
```

---

# 🔌 Configuração do SQL Server

Em algumas instalações o protocolo TCP/IP vem desabilitado.

Caso o sistema não conecte:

1. Abra:
```txt
SQL Server Configuration Manager
```

2. Vá em:
```txt
SQL Server Network Configuration
```

3. Selecione:
```txt
Protocols for SQLEXPRESS
```

4. Habilite:
```txt
TCP/IP
```

5. Reinicie o serviço SQL Server

---

## Porta padrão

```txt
1433
```

---

# 📝 Configuração do Arquivo INI

Na primeira execução o sistema cria automaticamente:

```txt
ProjectQuimica.ini
```

Local:

```txt
Win32\Debug\
```

---

## Exemplo do arquivo

```ini
[SERVER]
TipoDataBase=MSSQL
HostName=.\SQLEXPRESS
Port=1433
OSAuthent=Yes
User=sa
Password=sua_senha
Database=Quimica
```

---

# 🔍 Explicação dos Campos

| Campo | Descrição |
|---|---|
| TipoDataBase | Sempre MSSQL |
| HostName | Servidor ou instância |
| Port | Porta SQL Server |
| OSAuthent | Autenticação Windows |
| User | Usuário SQL |
| Password | Senha SQL |
| Database | Banco de dados |

---

## Autenticação Windows

```ini
OSAuthent=Yes
```

Neste caso:
- User e Password são ignorados.

---

## Autenticação SQL Server

```ini
OSAuthent=No
```

Neste caso:
- User e Password são obrigatórios.

---

# ⚛️ Instalação do Frontend React/Vite

Abra o terminal:

```bash
cd "DelphiTabelaPeriodica\Win32\Debug\HTML"
```

Execute:

```bash
npm install
```

---

## Principais dependências

- React 19
- React DOM 19
- Vite 8
- TypeScript 6
- TailwindCSS 4
- Lucide React
- XLSX

---

# ▶️ Inicializando o Frontend

O sistema Delphi inicializa automaticamente o Vite.

A inicialização manual serve apenas para validar o frontend.

Execute:

```bash
npm run dev
```

O Vite iniciará em:

```txt
http://localhost:5173
```

---

# 🌐 WebView2 Runtime

O sistema utiliza WebView2 para renderizar o frontend React dentro do Delphi.

Sem o WebView2 Runtime o sistema não funcionará.

## Download oficial

👉 https://developer.microsoft.com/pt-br/microsoft-edge/webview2/

---

# 🔄 Comunicação Delphi ↔ React

A comunicação entre Delphi e React é feita utilizando:

```javascript
window.chrome.webview.postMessage()
```

e no Delphi:

```delphi
OnWebMessageReceived
```

---

# 📥 Importação XLSX

O sistema:

- valida cabeçalhos
- valida ordem das colunas
- impede colunas extras
- ignora elementos duplicados
- cria grupos/períodos automaticamente

---

# 📤 Exportação XML

Exporta:

- número atômico
- símbolo
- nome
- massa atômica
- grupo
- período
- família
- categoria química

---

# 🖥 Executando o Sistema

## Opção 1 — Desenvolvimento

Utilize para:
- programar
- depurar
- editar funcionalidades

### Passos

1. Abra o `.dproj`
2. Compile o projeto
3. Pressione:

```txt
F9
```

---

## Opção 2 — Apenas testar

Caso deseje apenas utilizar a aplicação:

1. Vá até:

```txt
Win32\Debug\
```

2. Execute:

```txt
ProjectQuimica.exe
```

---

# ⚠️ Primeira Execução

Na primeira execução:

- o sistema cria automaticamente o arquivo INI
- a aplicação é encerrada
- o usuário deve configurar os dados de conexão

Mensagem exibida:

```txt
Configure o arquivo antes de inicializar a aplicação.
```

---

# ⚡ Funcionamento Automático do Vite

O sistema Delphi:

- localiza automaticamente o Node.js
- adiciona Node ao PATH
- inicia o Vite automaticamente
- encerra o processo ao fechar a aplicação

---

# ✅ Checklist Final

## Ambiente

- [ ] Node.js instalado
- [ ] npm funcionando
- [ ] SQL Server instalado
- [ ] WebView2 instalado

---

## Pacotes Delphi

- [ ] `WebView4DelphiVCLRTL.dproj` compilado com sucesso
- [ ] `WebView4DelphiVCL_designtime.dproj` compilado e instalado
- [ ] Componentes `TWVBrowser` e `TWVWindowParent` visíveis na paleta do Delphi

---

## Banco

- [ ] Banco Quimica criado
- [ ] Porta 1433 habilitada
- [ ] TCP/IP habilitado

---

## Frontend

- [ ] npm install executado
- [ ] Frontend React funcionando
- [ ] Dependências instaladas

---

## Sistema

- [ ] Arquivo INI configurado
- [ ] Aplicação Delphi compilando
- [ ] Conexão com banco funcionando
- [ ] CRUD funcionando
- [ ] Importação XLSX funcionando
- [ ] Exportação XML funcionando

---

# 📌 Observações

O projeto foi desenvolvido utilizando:

- Delphi 10.2 Tokyo
- SQL Server 2014 Express with Tools
- React 19
- Vite 8
- WebView2

Versões superiores podem funcionar normalmente.

---

# 📄 Licença

Projeto desenvolvido para fins educacionais e acadêmicos.
