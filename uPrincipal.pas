unit uPrincipal;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes,
  Vcl.Graphics,Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.ExtCtrls, FireDAC.Stan.Intf, FireDAC.Stan.Option, FireDAC.Stan.Error, FireDAC.UI.Intf,
  FireDAC.Phys.Intf, FireDAC.Stan.Def, FireDAC.Stan.Pool, FireDAC.Stan.Async, FireDAC.Phys, FireDAC.Phys.MSSQL,
  FireDAC.Phys.MSSQLDef, Data.DB, FireDAC.Comp.Client, uDTMConexao, cArquivoIni,
  cAtualizaBancoDeDados, Winapi.ShellAPI, System.IOUtils, Vcl.OleCtrls, SHDocVw, uWVBrowserBase, uWVBrowser, uWVWinControl,
  uWVWindowParent, uWVLoader,  System.JSON, cCadElemento, cCadGrupo, cCadPeriodo,
  cCadFamilia, cCadCategoriaQuimica, uWVCoreWebView2Args, uWVInterfaces, uWVTypeLibrary,
  uWVTypes, cGetId, Registry ;

const
  WM_EXPORTAR_XML = WM_USER + 1;

type
  TfrmPrincipal = class(TForm)
    WVWindowParent1: TWVWindowParent;
    WVBrowser1: TWVBrowser;
    procedure FormCreate(Sender: TObject);
    procedure FormResize(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
  private
    { Private declarations }
    FViteProcessHandle: THandle;
    FBrowserReady: Boolean;
    FRegistrosExportar: TJSONArray;
    procedure ExportarXML;
    procedure AtualizacaoBancoDados;
    procedure WVBrowser1WebMessageReceived(Sender: TObject;
      const aWebView: ICoreWebView2;
      const aArgs: ICoreWebView2WebMessageReceivedEventArgs);
    procedure WVBrowser1AfterCreated(Sender: TObject);
    procedure TimerNavigate(Sender: TObject);
    procedure ExecutarAcao(const aJSON: TJSONObject);
    procedure EnviarParaHTML(const aJSON: string);
    function QueryParaJSON(Qry: TFDQuery; const aEntidade: string): string;
    function GetNodePath: string;
    procedure WMExportarXML(var Msg: TMessage); message WM_EXPORTAR_XML;
    function EscapeJSON(const ATexto: string): string;
    procedure RespostaErro(const AMensagem: string);
    procedure RespostaSucesso(const AMensagem: string);
  public
    { Public declarations }
  end;
var
  frmPrincipal: TfrmPrincipal;

implementation

{$R *.dfm}

procedure TfrmPrincipal.WMExportarXML(var Msg: TMessage);
begin
  ExportarXML;
end;

{$REGION 'Browser'}
procedure TfrmPrincipal.WVBrowser1AfterCreated(Sender: TObject);
begin
  FBrowserReady := True;
  WVWindowParent1.SetBounds(0, 0, ClientWidth, ClientHeight);
  WVWindowParent1.UpdateSize;
end;

procedure TfrmPrincipal.WVBrowser1WebMessageReceived(
  Sender: TObject;
  const aWebView: ICoreWebView2;
  const aArgs: ICoreWebView2WebMessageReceivedEventArgs);
var
  TempArgs : TCoreWebView2WebMessageReceivedEventArgs;
  Mensagem : wvstring;
  oJSON    : TJSONObject;
  oClone   : TJSONObject;
begin
  TempArgs := TCoreWebView2WebMessageReceivedEventArgs.Create(aArgs);

  try
    Mensagem := TempArgs.WebMessageAsString;

    oJSON := TJSONObject.ParseJSONValue(Mensagem) as TJSONObject;

    if Assigned(oJSON) then
    begin
      oClone := oJSON.Clone as TJSONObject;

      TThread.Queue(nil,
      procedure
      var
        JSONLocal: TJSONObject;
      begin
        JSONLocal := oClone;
        try
          ExecutarAcao(JSONLocal);
        finally
          JSONLocal.Free;
        end;
      end);
    end;

  finally
    oJSON.Free;
    TempArgs.Free;
  end;
end;

function TfrmPrincipal.EscapeJSON(const ATexto: string): string;
begin
  Result := ATexto;

  Result := StringReplace(Result, '\', '\\', [rfReplaceAll]);
  Result := StringReplace(Result, '"', '\"', [rfReplaceAll]);
  Result := StringReplace(Result, #13, '', [rfReplaceAll]);
  Result := StringReplace(Result, #10, '\n', [rfReplaceAll]);
end;

procedure TfrmPrincipal.RespostaErro(const AMensagem: string);
begin
  EnviarParaHTML(
    Format(
      '{"sucesso":false,"mensagem":"%s"}',
      [EscapeJSON(AMensagem)]
    )
  );
end;

procedure TfrmPrincipal.RespostaSucesso(const AMensagem: string);
begin
  EnviarParaHTML(
    Format(
      '{"sucesso":true,"mensagem":"%s"}',
      [EscapeJSON(AMensagem)]
    )
  );
end;

{
procedure TfrmPrincipal.WVBrowser1WebMessageReceived(Sender: TObject; const aWebView: ICoreWebView2;
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
 }

procedure TfrmPrincipal.FormResize(Sender: TObject);
begin
  if WVBrowser1.Initialized then
  begin
    WVWindowParent1.SetBounds(0, 0, ClientWidth, ClientHeight);
    WVWindowParent1.UpdateSize;
  end;
end;

procedure TfrmPrincipal.TimerNavigate(Sender: TObject);
begin
  if FBrowserReady then
  begin
    TTimer(Sender).Enabled := False;
    WVWindowParent1.SetBounds(0, 0, ClientWidth, ClientHeight);
    WVWindowParent1.UpdateSize;
    WVBrowser1.Navigate('http://localhost:5173');
  end;
end;
{$ENDREGION}

procedure TfrmPrincipal.AtualizacaoBancoDados;
var
  oAtualizarMSSQL: TAtualizaBancoDeDadosMSSQL;
begin
  try
    oAtualizarMSSQL := TAtualizaBancoDeDadosMSSQL.Create(dtmPrincipal.ConexaoDB);
    oAtualizarMSSQL.AtualizaBancoDeDadosMSSQL;
  finally
    if Assigned(oAtualizarMSSQL) then
      FreeAndNil(oAtualizarMSSQL);
  end;
end;


function TfrmPrincipal.GetNodePath: string;
var
  oReg: TRegistry;
  sPaths: string;
  aPathList: TArray<string>;
  sPath: string;
  i: Integer;
begin
  Result := '';

  oReg := TRegistry.Create(KEY_READ);
  try
    oReg.RootKey := HKEY_LOCAL_MACHINE;
    if oReg.OpenKey('\SOFTWARE\Node.js', False) then
    begin
      Result := oReg.ReadString('InstallPath');
      Result := ExcludeTrailingPathDelimiter(Result);
      oReg.CloseKey;
    end;
  finally
    oReg.Free;
  end;

  if DirectoryExists(Result) and FileExists(Result + '\npm.cmd') then
    Exit;

  Result := '';
  if FileExists('C:\Program Files\nodejs\npm.cmd') then
  begin
    Result := 'C:\Program Files\nodejs';
    Exit;
  end;

  if FileExists('C:\Program Files (x86)\nodejs\npm.cmd') then
  begin
    Result := 'C:\Program Files (x86)\nodejs';
    Exit;
  end;

  sPaths    := GetEnvironmentVariable('PATH');
  aPathList := sPaths.Split([';']);
  for i := 0 to High(aPathList) do
  begin
    sPath := Trim(aPathList[i]);
    if FileExists(sPath + '\npm.cmd') then
    begin
      Result := sPath;
      Exit;
    end;
  end;
end;

procedure TfrmPrincipal.FormClose(Sender: TObject; var Action: TCloseAction);
begin
  if FViteProcessHandle <> 0 then
    begin
      TerminateProcess(FViteProcessHandle, 0);
      CloseHandle(FViteProcessHandle);
      FViteProcessHandle := 0;
    end;
end;

procedure TfrmPrincipal.FormCreate(Sender: TObject);
var
  oTimer: TTimer;
  oStartInfo: TStartupInfo;
  oProcessInfo: TProcessInformation;
  sNodePath: string;
  sCmd: string;
  sNpm: string;
begin
  {$REGION 'LocalHost'}
  if FViteProcessHandle <> 0 then
  begin
    TerminateProcess(FViteProcessHandle, 0);
    CloseHandle(FViteProcessHandle);
    FViteProcessHandle := 0;
  end;

  sNodePath := GetNodePath;

  if sNodePath = '' then
  begin
    ShowMessage('Node.js não encontrado!' + #13 +
                'Instale o Node.js em nodejs.org e reinicie.');
    Application.Terminate;
    Exit;
  end;

  SetEnvironmentVariable('PATH',
    PChar(sNodePath + ';' + GetEnvironmentVariable('PATH')));

  sNpm := '"' + sNodePath + '\npm.cmd"';
  sCmd := 'cmd.exe /c cd /d "' +
          ExtractFilePath(ParamStr(0)) + 'html" && ' + sNpm + ' run dev';

  ZeroMemory(@oStartInfo, SizeOf(oStartInfo));
  oStartInfo.cb          := SizeOf(oStartInfo);
  oStartInfo.dwFlags     := STARTF_USESHOWWINDOW;
  oStartInfo.wShowWindow := SW_HIDE;

  if CreateProcess(nil, PChar(sCmd), nil, nil, False,
                   CREATE_NEW_CONSOLE, nil, nil,
                   oStartInfo, oProcessInfo) then
  begin
    FViteProcessHandle := oProcessInfo.hProcess;
    CloseHandle(oProcessInfo.hThread);
  end
  else
    ShowMessage('Falha ao iniciar Vite. Erro: ' + SysErrorMessage(GetLastError));

  WVWindowParent1.Browser         := WVBrowser1;
  WVBrowser1.OnAfterCreated       := WVBrowser1AfterCreated;
  WVBrowser1.OnWebMessageReceived := WVBrowser1WebMessageReceived;
  WVBrowser1.CreateBrowser(WVWindowParent1.Handle);
  OnResize := FormResize;

  oTimer          := TTimer.Create(Self);
  oTimer.Interval := 2500;
  oTimer.OnTimer  := TimerNavigate;
  oTimer.Enabled  := True;
  {$ENDREGION}

  if not FileExists(TArquivoIni.ArquivoIni) then
  begin
    TArquivoIni.AtualizarIni('SERVER', 'TipoDataBase', 'MSSQL');
    TArquivoIni.AtualizarIni('SERVER', 'HostName', '.\');
    TArquivoIni.AtualizarIni('SERVER', 'Port', '1433');
    TArquivoIni.AtualizarIni('SERVER', 'OSAuthent', 'Yes');
    TArquivoIni.AtualizarIni('SERVER', 'User', 'sa');
    TArquivoIni.AtualizarIni('SERVER', 'Password', 'Sua_Senha');
    TArquivoIni.AtualizarIni('SERVER', 'Database', 'Quimica');

    MessageDlg('Arquivo ' + TArquivoIni.ArquivoIni + ' criado com sucesso!' + #13 + 'Configure o arquivo antes de inicializar a aplicação!!!', mtInformation, [mbOK], 0);

    Application.Terminate;
    Exit;
  end;

  dtmPrincipal := TdtmPrincipal.Create(Self);

  with dtmPrincipal.ConexaoDB do
  begin
    Connected := False;
    Params.Clear;
    Params.DriverID := 'MSSQL';
    Params.Add('Server=' + TArquivoIni.LerIni('SERVER', 'HostName'));
    Params.Add('Database=' + TArquivoIni.LerIni('SERVER', 'Database'));

    if TArquivoIni.LerIni('SERVER', 'OSAuthent') = 'Yes' then
      Params.Add('OSAuthent=Yes')
    else
    begin
      Params.Add('User_Name=' + TArquivoIni.LerIni('SERVER', 'User'));
      Params.Add('Password=' + TArquivoIni.LerIni('SERVER', 'Password'));
    end;

    if TArquivoIni.LerIni('SERVER', 'Port') <> '' then
      Params.Add('Port=' + TArquivoIni.LerIni('SERVER', 'Port'));

    LoginPrompt := False;
    try
      Connected := True;
    except
      on E: Exception do
      begin
        ShowMessage('Erro ao conectar: ' + E.Message);
        Exit;
      end;
    end;
  end;

  dtmPrincipal.ConexaoDB.Connected := True;

  AtualizacaoBancoDados;
end;

procedure TfrmPrincipal.FormDestroy(Sender: TObject);
begin
   if FViteProcessHandle <> 0 then
  begin
    TerminateProcess(FViteProcessHandle, 0);
    CloseHandle(FViteProcessHandle);
    FViteProcessHandle := 0;
  end;
end;

{$REGION 'ExecutarAcao'}
function TfrmPrincipal.QueryParaJSON(Qry: TFDQuery; const aEntidade: string): string;
var
  oResp: TJSONObject;
  oArray: TJSONArray;
  oRow: TJSONObject;
  i: Integer;
begin
  oResp  := TJSONObject.Create;
  oArray := TJSONArray.Create;
  try
    Qry.First;
    while not Qry.Eof do
    begin
      oRow := TJSONObject.Create;
      for i := 0 to Qry.FieldCount  -1 do
        oRow.AddPair(Qry.Fields[i].FieldName, Qry.Fields[i].AsString);
      oArray.Add(oRow);
      Qry.Next;
    end;

    oResp.AddPair('sucesso', TJSONBool.Create(True));
    oResp.AddPair('mensagem', 'Dados carregados');
    oResp.AddPair('entidade', aEntidade);
    oResp.AddPair('dados', oArray);

    Result := oResp.ToJSON;
  finally
    oResp.Free;
  end;
end;

procedure TfrmPrincipal.ExportarXML;
var
  oSave : TSaveDialog;
  oXML  : TStringList;
  I     : Integer;
  Item  : TJSONObject;
begin
if (FRegistrosExportar  = nil) or (FRegistrosExportar.Count = 0) then
  begin
    EnviarParaHTML('{"acao":"erro","msg":"Nenhum registro para exportar"}');
    Exit;
  end;

  oSave := TSaveDialog.Create(nil);
  oXML  := TStringList.Create;

  try
    oSave.Filter   := 'XML (*.xml)|*.xml';
    oSave.FileName := 'exportacao.xml';

    if not oSave.Execute then
      Exit;

    oXML.Add('<?xml version="1.0" encoding="UTF-8"?>');
    oXML.Add('<dados>');

    for I := 0 to FRegistrosExportar.Count - 1 do
    begin
      Item := FRegistrosExportar.Items[I] as TJSONObject;

      oXML.Add('  <elemento>');
      oXML.Add('    <numero_atomico>' + Item.GetValue<string>('numero_atomico') + '</numero_atomico>');
      oXML.Add('    <simbolo>'        + Item.GetValue<string>('simbolo')        + '</simbolo>');
      oXML.Add('    <nome>'           + Item.GetValue<string>('nome')           + '</nome>');
      oXML.Add('    <massa_atomica>'  + Item.GetValue<string>('massa_atomica')  + '</massa_atomica>');
      oXML.Add('    <grupo>'          + Item.GetValue<string>('grupo')          + '</grupo>');
      oXML.Add('    <periodo>'        + Item.GetValue<string>('periodo')        + '</periodo>');
      oXML.Add('    <familia>'        + Item.GetValue<string>('familia')        + '</familia>');
      oXML.Add('    <categoria_quimica>' + Item.GetValue<string>('categoria_quimica') + '</categoria_quimica>');
      oXML.Add('  </elemento>');
    end;

    oXML.Add('</dados>');

    oXML.SaveToFile(oSave.FileName, TEncoding.UTF8);

    EnviarParaHTML('{"acao":"ok","msg":"XML exportado com sucesso"}');

  finally
    oSave.Free;
    oXML.Free;
  end;
end;

function ValidarCabecalho(Item: TJSONObject): Boolean;
const
  CAMPOS_ESPERADOS: array[0..7] of string = (
    'numero_atomico',
    'simbolo',
    'nome',
    'massa_atomica',
    'grupo',
    'periodo',
    'familia',
    'categoria_quimica'
  );
var
  I: Integer;
begin
  Result := False;

  if Item.Count <> Length(CAMPOS_ESPERADOS) then
    Exit;

  for I := 0 to High(CAMPOS_ESPERADOS) do
  begin
    if LowerCase(Item.Pairs[I].JsonString.Value) <>
       CAMPOS_ESPERADOS[I] then
    begin
      Exit;
    end;
  end;

  Result := True;
end;

procedure TfrmPrincipal.EnviarParaHTML(const aJSON: string);
var
  oStr: TJSONString;
begin
  oStr := TJSONString.Create(aJSON);
  try
    WVBrowser1.ExecuteScript('window.receberDelphi(' + oStr.ToJSON + ')');
  finally
    oStr.Free;
  end;
end;

procedure TfrmPrincipal.ExecutarAcao(const aJSON: TJSONObject);
var
  sAcao, sEntidade: string;
  oResp: TJSONObject;
  oElemento: TElemento;
  oGrupo: TGrupo;
  oFamilia: TFamilia;
  oPeriodo: TPeriodo;
  oCategoria: TCategoriaQuimica;
  Qry: TFDQuery;
  sJSON: string;
  Dados: TJSONArray;
  I: Integer;
  oGet: TGetID;
  Item: TJSONObject;
  GrupoID: Integer;
  PeriodoID: Integer;
  FamiliaID: Integer;
  CategoriaID: Integer;
begin
  try

    if not Assigned(aJSON) then
    begin
      RespostaErro('JSON inválido');
      Exit;
    end;

    if not aJSON.TryGetValue<string>('acao', sAcao) then
    begin
      RespostaErro('Ação não informada');
      Exit;
    end;

    sEntidade := '';
    aJSON.TryGetValue<string>('entidade', sEntidade);  //Elemento,Grupo,Periodo,Familia e Categoria_Quimica

    if sAcao = 'listar' then
    begin
      Qry := TFDQuery.Create(nil);
        try
          Qry.Connection := dtmPrincipal.ConexaoDB;

          if sEntidade = 'elemento' then
            Qry.SQL.Text  :=
            ' SELECT e.elementoId, e.numero_atomico, e.simbolo, e.nome, ' +
            '        e.massa_atomica, g.descricao as grupo, p.descricao as periodo, ' +
            '        f.descricao as familia, c.descricao as categoria_quimica ' +
            '   FROM elemento e ' +
            '   LEFT JOIN grupo g ON g.grupoId = e.grupo_id ' +
            '   LEFT JOIN periodo p ON p.periodoId = e.periodo_id ' +
            '   LEFT JOIN familia f ON f.familiaId = e.familia_id ' +
            '   LEFT JOIN categoria_quimica c ON c.categoria_quimicaId = e.categoria_quimica_id ' +
            '  ORDER BY e.numero_atomico '
            else if sEntidade = 'grupo' then
            Qry.SQL.Text := 'SELECT grupoId, descricao FROM grupo ORDER BY descricao'
          else if sEntidade = 'periodo' then
            Qry.SQL.Text := 'SELECT periodoId, descricao FROM periodo ORDER BY descricao'
          else if sEntidade = 'familia' then
            Qry.SQL.Text := 'SELECT familiaId, descricao FROM familia ORDER BY descricao'
          else if sEntidade = 'categoria_quimica' then
            Qry.SQL.Text := 'SELECT categoria_quimicaId, descricao FROM categoria_quimica ORDER BY descricao';

            Qry.Open;
            EnviarParaHTML(QueryParaJSON(Qry, sEntidade));
        finally
          Qry.Free;
        end;
    end

    else if sAcao = 'inserir' then
    begin
      if sEntidade = 'elemento' then
      begin
        oElemento := TElemento.Create(dtmPrincipal.ConexaoDB);
        try
          oElemento.atomico   := aJSON.GetValue<Integer>('numero_atomico');
          oElemento.simbolo   := aJSON.GetValue<string>('simbolo');
          oElemento.nome      := aJSON.GetValue<string>('nome');
          if (aJSON.Values['massa_atomica'] = nil) or
             (aJSON.Values['massa_atomica'] is TJSONNull) or
             (Trim(aJSON.GetValue<string>('massa_atomica')) = '') then
            oElemento.massa := 0
          else
            oElemento.massa := aJSON.GetValue<Double>('massa_atomica');
          oElemento.grupo     := aJSON.GetValue<Integer>('grupo_id');
          oElemento.periodo   := aJSON.GetValue<Integer>('periodo_id');
          if (aJSON.Values['familia_id'] = nil) or
             (aJSON.Values['familia_id'] is TJSONNull) then
             oElemento.familia := 0
          else
            oElemento.familia := aJSON.GetValue<Integer>('familia_id');

          if (aJSON.Values['categoria_quimica_id'] = nil) or
             (aJSON.Values['categoria_quimica_id'] is TJSONNull) then
            oElemento.categoria := 0
          else
            oElemento.categoria := aJSON.GetValue<Integer>('categoria_quimica_id');

           if oElemento.Inserir then
            RespostaSucesso('Elemento inserido com sucesso!')
          else
            RespostaErro('Falha ao inserir.');
        finally
          oElemento.Free;
        end;
      end

      else if sEntidade = 'grupo' then
      begin
        oGrupo := TGrupo.Create(dtmPrincipal.ConexaoDB);
        try
          oGrupo.descricao := aJSON.GetValue<string>('descricao');

          if oGrupo.Inserir then
            RespostaSucesso('Grupo inserido com sucesso!')
          else
            RespostaErro('Falha ao inserir.');
        finally
          oGrupo.Free;
        end;
      end

      else if sEntidade = 'periodo' then
      begin
        oPeriodo := TPeriodo.Create(dtmPrincipal.ConexaoDB);
        try
          oPeriodo.descricao := aJSON.GetValue<string>('descricao');

          if oPeriodo.Inserir then
            RespostaSucesso('Período inserido com sucesso!')
          else
            RespostaErro('Falha ao inserir.');
        finally
          oPeriodo.Free;
        end;
      end

      else if sEntidade = 'familia' then
      begin
        oFamilia := TFamilia.Create(dtmPrincipal.ConexaoDB);
        try
          oFamilia.descricao := aJSON.GetValue<string>('descricao');

          if oFamilia.Inserir then
            RespostaSucesso('Família inserido com sucesso!')
          else
            RespostaErro('Falha ao inserir.');
        finally
          oFamilia.Free;
        end;
      end

      else if sEntidade = 'categoria_quimica' then
      begin
        oCategoria := TCategoriaQuimica.Create(dtmPrincipal.ConexaoDB);
        try
          oCategoria.descricao := aJSON.GetValue<string>('descricao');

          if oCategoria.Inserir then
            RespostaSucesso('Categoria Química inserido com sucesso!')
          else
            RespostaErro('Falha ao inserir.');
        finally
          oCategoria.Free;
        end;
      end;
    end

    else if sAcao = 'atualizar' then
    begin
      if sEntidade = 'elemento' then
      begin
        oElemento := TElemento.create(dtmPrincipal.ConexaoDB);
        try
          oElemento.codigo    := aJSON.GetValue<Integer>('elementoId');
          oElemento.atomico   := aJSON.GetValue<Integer>('numero_atomico');
          oElemento.simbolo   := aJSON.GetValue<string>('simbolo');
          oElemento.nome      := aJSON.GetValue<string>('nome');
          if (aJSON.Values['massa_atomica'] = nil) or
             (aJSON.Values['massa_atomica'] is TJSONNull) or
             (Trim(aJSON.GetValue<string>('massa_atomica')) = '') then
            oElemento.massa := 0
          else
            oElemento.massa := aJSON.GetValue<Double>('massa_atomica');
          oElemento.grupo     := aJSON.GetValue<Integer>('grupo_id');
          oElemento.periodo   := aJSON.GetValue<Integer>('periodo_id');
          if (aJSON.Values['familia_id'] = nil) or
             (aJSON.Values['familia_id'] is TJSONNull) then
             oElemento.familia := 0
          else
            oElemento.familia := aJSON.GetValue<Integer>('familia_id');

          if (aJSON.Values['categoria_quimica_id'] = nil) or
             (aJSON.Values['categoria_quimica_id'] is TJSONNull) then
            oElemento.categoria := 0
          else
            oElemento.categoria := aJSON.GetValue<Integer>('categoria_quimica_id');

          if oElemento.Atualizar  then
            RespostaSucesso('Elemento atualizado!')
          else
            RespostaErro('Falha ao atualizar.');
        finally
          oElemento.Free;
        end;
      end

      else if sEntidade = 'grupo' then
      begin
        oGrupo := TGrupo.Create(dtmPrincipal.ConexaoDB);
        try
          oGrupo.codigo    := aJSON.GetValue<Integer>('grupoId');
          oGrupo.descricao := aJSON.GetValue<string>('descricao');

          if oGrupo.Atualizar then
            RespostaSucesso('Grupo atualizado!')
          else
            RespostaErro('Falha ao atualizar.');
        finally
          oGrupo.Free;
        end;
      end

      else if sEntidade = 'periodo' then
      begin
        oPeriodo := TPeriodo.Create(dtmPrincipal.ConexaoDB);
        try
          oPeriodo.codigo    := aJSON.GetValue<Integer>('periodoId');
          oPeriodo.descricao := aJSON.GetValue<string>('descricao');

          if oPeriodo.Atualizar then
            RespostaSucesso('Período atualizado!')
          else
            RespostaErro('Falha ao atualizar.');
        finally
          oPeriodo.Free;
        end;
      end

      else if sEntidade = 'familia' then
      begin
        oFamilia := TFamilia.Create(dtmPrincipal.ConexaoDB);
        try
          oFamilia.codigo    := aJSON.GetValue<integer>('familiaId');
          oFamilia.descricao := aJSON.GetValue<string>('descricao');

          if oFamilia.Atualizar then
            RespostaSucesso('Família atualizado!')
          else
            RespostaErro('Falha ao atualizar.');
        finally
          oFamilia.Free;
        end;
      end

      else if sEntidade = 'categoria_quimica' then
      begin
        oCategoria := TCategoriaQuimica.Create(dtmPrincipal.ConexaoDB);
        try
          oCategoria.codigo    := aJSON.GetValue<Integer>('categoria_quimicaId');
          oCategoria.descricao := aJSON.GetValue<string>('descricao');

          if oCategoria.Atualizar then
            RespostaSucesso('Categoria Química atualizado!')
          else
            RespostaErro('Falha ao atualizar.');
        finally
          oCategoria.Free;
        end;
      end;
    end

    else if sAcao = 'apagar' then
    begin
      if sEntidade = 'elemento' then
      begin
        oElemento := TElemento.Create(dtmPrincipal.ConexaoDB);
        try
          oElemento.codigo  := aJSON.GetValue<Integer>('elementoId');
          try
            if oElemento.Apagar then
              RespostaSucesso('Elemento excluído!')
            else
              RespostaErro('Falha ao excluir.');
          except
             on E: Exception do
              RespostaErro(E.Message);
          end;
        finally
          oElemento.Free;
        end;
      end

      else if sEntidade = 'grupo' then
      begin
        oGrupo := TGrupo.Create(dtmPrincipal.ConexaoDB);
        try
          oGrupo.codigo := aJSON.GetValue<Integer>('grupoId');
          try
            if oGrupo.Apagar  then
              RespostaSucesso('Grupo excluído!')
            else
              RespostaErro('Falha ao excluir.');
          except
            on E: Exception do
              RespostaErro(E.Message);
          end;
        finally
          oGrupo.Free;
        end;
      end

      else if sEntidade = 'periodo' then
      begin
        oPeriodo := TPeriodo.Create(dtmPrincipal.ConexaoDB);
        try
          oPeriodo.codigo := aJSON.GetValue<Integer>('periodoId');
          try
            if oPeriodo.Apagar  then
              RespostaSucesso('Perído excluído!')
            else
              RespostaErro('Falha ao excluir.');
          except
            on E: Exception do
              RespostaErro(E.Message);
          end;
        finally
          oPeriodo.Free;
        end;
      end

      else if sEntidade = 'familia' then
      begin
        oFamilia := TFamilia.Create(dtmPrincipal.ConexaoDB);
        try
          oFamilia.codigo := aJSON.GetValue<Integer>('familiaId');
          try
            if oFamilia.Apagar  then
              RespostaSucesso('família excluído!')
            else
              RespostaErro('Falha ao excluir.');
          except
            on E: Exception do
              RespostaErro(E.Message);
          end;
        finally
          oFamilia.Free;
        end;
      end

      else if sEntidade = 'categoria_quimica' then
      begin
        oCategoria := TCategoriaQuimica.Create(dtmPrincipal.ConexaoDB);
        try
          oCategoria.codigo :=  aJSON.GetValue<Integer>('categoria_quimicaId');
          try
            if oCategoria.Apagar  then
              RespostaSucesso('Categoria Química excluído!')
            else
              RespostaErro('Falha ao excluir.');
          except
            on E: Exception do
              RespostaErro(E.Message);
          end;
        finally
          oCategoria.Free;
        end;
      end;
    end

    else if sAcao = 'importar' then
    begin
      Qry := TFDQuery.Create(nil);
      oGet := TGetID.Create(dtmPrincipal.ConexaoDB);
      try
        Qry.Connection  := dtmPrincipal.ConexaoDB;

        Dados := aJSON.GetValue<TJSONArray>('dados');

        if (Dados = nil) or (Dados.Count = 0) then
        begin
          RespostaErro('Tabela vazia');
          Exit;
        end;

        Item := Dados.Items[0] as TJSONObject;

        if not ValidarCabecalho(Item) then
        begin
          EnviarParaHTML(
            '{"acao":"erro","msg":"Formatação inválida ou ordem errada das colunas"}'
          );
          Exit;
        end;

        dtmPrincipal.ConexaoDB.StartTransaction;
        try
          for I := 0 to Dados.Count -1 do
          begin
            Item := Dados.Items[I] as TJSONObject;

            try
              if Trim(Item.GetValue<string>('numero_atomico')) = '' then
                raise Exception.Create('Tabela faltando número atômico');

              if Trim(Item.GetValue<string>('simbolo')) = '' then
                raise Exception.Create('Tabela faltando símbolo');

              if Trim(Item.GetValue<string>('nome')) = '' then
                raise Exception.Create('Tabela faltando nome');

              if Trim(Item.GetValue<string>('grupo')) = '' then
                raise Exception.Create('Tabela faltando grupo');

              if Trim(Item.GetValue<string>('periodo')) = '' then
                raise Exception.Create('Tabela faltando período');

              Qry.Close;
              Qry.SQL.Clear;
              Qry.SQL.Add('SELECT elementoId');
              Qry.SQL.Add('FROM elemento');
              Qry.SQL.Add('WHERE numero_atomico = :numero_atomico');

              Qry.ParamByName('numero_atomico').AsInteger :=
                Item.GetValue<Integer>('numero_atomico');

              Qry.Open;

              if not Qry.IsEmpty then
                Continue;

              GrupoID :=
                oGet.GetGrupoID(
                  Item.GetValue<string>('grupo')
                );

              PeriodoID :=
                oGet.GetPeriodoID(
                  Item.GetValue<string>('periodo')
                );

              FamiliaID :=
                oGet.GetFamiliaID(
                  Item.GetValue<string>('familia')
                );

              CategoriaID :=
                oGet.GetCategoriaID(
                  Item.GetValue<string>('categoria_quimica')
                );

              oElemento := TElemento.Create(dtmPrincipal.ConexaoDB);
              try
                oElemento.atomico :=
                  Item.GetValue<Integer>('numero_atomico');

                oElemento.simbolo :=
                  Item.GetValue<string>('simbolo');

                oElemento.nome :=
                  Item.GetValue<string>('nome');

                oElemento.massa :=
                  Item.GetValue<Double>('massa_atomica');

                oElemento.grupo := GrupoID;
                oElemento.periodo := PeriodoID;
                oElemento.familia := FamiliaID;
                oElemento.categoria := CategoriaID;

                oElemento.Inserir(False);

              finally
                oElemento.Free;
              end;

            except
              on E: Exception do
                raise Exception.CreateFmt(
                  'Erro na linha %d. Elemento "%s". %s',
                  [
                    I + 2,
                    Item.GetValue<string>('nome'),
                    E.Message
                  ]
                );
            end;
          end;

          dtmPrincipal.ConexaoDB.Commit;

          RespostaSucesso('Importação realizada com sucesso');
        except
            on E: Exception do
            begin
              dtmPrincipal.ConexaoDB.Rollback;

              RespostaErro(E.Message);
            end;
        end;
      finally
        Qry.Free;
        oGet.Free;
      end;
    end

    else if sAcao = 'exportar' then
    begin
      FreeAndNil(FRegistrosExportar);

      FRegistrosExportar :=
        aJSON.GetValue<TJSONArray>('registros').Clone as TJSONArray;

      PostMessage(Handle, WM_EXPORTAR_XML, 0, 0);
    end

    else if sAcao = 'Fechar' then
      Application.Terminate;
  except
    on E: Exception do
    begin
      RespostaErro(E.Message);
    end;
  end;
end;
{$ENDREGION}
end.
