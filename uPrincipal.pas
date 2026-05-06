unit uPrincipal;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes,
  Vcl.Graphics,Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.ExtCtrls, FireDAC.Stan.Intf, FireDAC.Stan.Option, FireDAC.Stan.Error, FireDAC.UI.Intf,
  FireDAC.Phys.Intf, FireDAC.Stan.Def, FireDAC.Stan.Pool, FireDAC.Stan.Async, FireDAC.Phys, FireDAC.Phys.MSSQL,
  FireDAC.Phys.MSSQLDef, FireDAC.VCLUI.Wait, Data.DB, FireDAC.Comp.Client, uDTMConexao, cArquivoIni,
  cAtualizaBancoDeDados, Winapi.ShellAPI, System.IOUtils, Vcl.OleCtrls, SHDocVw, uWVBrowserBase, uWVBrowser, uWVWinControl,
  uWVWindowParent, uWVLoader,  System.JSON, uWVCoreWebView2Args, cCadElemento,
  cCadGrupo, cCadPeriodo, cCadFamilia, cCadCategoriaQuimica;

type
  TfrmPrincipal = class(TForm)
    WVWindowParent1: TWVWindowParent;
    WVBrowser1: TWVBrowser;
    procedure FormCreate(Sender: TObject);
    procedure FormResize(Sender: TObject);
    procedure FormShow(Sender: TObject);
  private
    { Private declarations }
    FBrowserReady: Boolean;
    procedure AtualizacaoBancoDados;
    procedure WVBrowser1AfterCreated(Sender: TObject);
    procedure TimerNavigate(Sender: TObject);
    procedure ExecutarAcao(const aJSON: TJSONObject);
    procedure EnviarParaHTML(const aJSON: string);
    function QueryParaJSON(Qry: TFDQuery; const aEntidade: string): string;
  public
    { Public declarations }
  end;

var
  frmPrincipal: TfrmPrincipal;

implementation

{$R *.dfm}

{$REGION 'Browser'}
  procedure TfrmPrincipal.WVBrowser1AfterCreated(Sender: TObject);
  begin
     FBrowserReady := True;
    WVWindowParent1.SetBounds(0, 0, ClientWidth, ClientHeight);
    WVWindowParent1.UpdateSize;
  end;

  procedure TfrmPrincipal.FormResize(Sender: TObject);
  begin
    if WVBrowser1.Initialized then
    begin
      WVWindowParent1.SetBounds(0, 0, ClientWidth, ClientHeight);
      WVWindowParent1.UpdateSize;
    end;
  end;

  procedure TfrmPrincipal.FormShow(Sender: TObject);
  begin
    if FBrowserReady then
      WVBrowser1.Navigate('http://localhost:5173');
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

procedure TfrmPrincipal.FormCreate(Sender: TObject);
var
  oTimer: TTimer;
  oStartInfo: TStartupInfo;
  oProcessInfo: TProcessInformation;
  sCmd: string;
begin
  {$REGION 'LocalHost'}
    sCmd := 'cmd.exe /c cd /d "' +
          ExtractFilePath(ParamStr(0)) + 'html" && npm run dev';

  ZeroMemory(@oStartInfo, SizeOf(oStartInfo));
  oStartInfo.cb := SizeOf(oStartInfo);
  oStartInfo.dwFlags := STARTF_USESHOWWINDOW;
  oStartInfo.wShowWindow := SW_HIDE;

  CreateProcess(nil, PChar(sCmd), nil, nil, False,
                CREATE_NEW_CONSOLE, nil, nil,
                oStartInfo, oProcessInfo);

  Sleep(2000);

  WVWindowParent1.Browser   := WVBrowser1;
  WVBrowser1.OnAfterCreated := WVBrowser1AfterCreated;
  WVBrowser1.CreateBrowser(WVWindowParent1.Handle);
  OnResize := FormResize;

  oTimer := TTimer.Create(Self);
  oTimer.Interval := 300;
  oTimer.OnTimer  := TimerNavigate;
  oTimer.Enabled  := True;
  {$ENDREGION}

  if not FileExists(TArquivoIni.ArquivoIni) then
  begin
    TArquivoIni.AtualizarIni('SERVER', 'TipoDataBase', 'MSSQL');
    TArquivoIni.AtualizarIni('SERVER', 'HostName', '.\');
    TArquivoIni.AtualizarIni('SERVER', 'Port', '1433');
    TArquivoIni.AtualizarIni('SERVER', 'OSAuthent', 'Yes');
    TArquivoIni.AtualizarIni('SERVER', 'User', 'admin');
    TArquivoIni.AtualizarIni('SERVER', 'Password', 'admin');
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

    oResp.AddPair('acao', 'dados');
    oResp.AddPair('entidade', aEntidade);
    oResp.AddPair('registros', oArray);

    Result := oResp.ToJSON;
  finally
    oResp.Free;
  end;
end;


procedure TfrmPrincipal.EnviarParaHTML(const aJSON: string);
begin
  WVBrowser1.ExecuteScript('window.receberDelphi(' + QuotedStr(aJSON) + ')');
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
begin
  sAcao     := aJSON.GetValue<string>('acao');      //Acoes do CRUD e listar (Popular os DataTables)
  sEntidade := aJSON.GetValue<string>('entidade');  //Elemento,Grupo,Periodo,Familia e Categoria_Quimica

  if sAcao = 'Listar' then
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
        oElemento.massa     := aJSON.GetValue<Double>('massa_atomica');
        oElemento.grupo     := aJSON.GetValue<Integer>('grupo_id');
        oElemento.periodo   := aJSON.GetValue<Integer>('periodo_id');
        oElemento.familia   := aJSON.GetValue<Integer>('familia_id');
        oElemento.categoria := aJSON.GetValue<Integer>('categoria_quimica_id');

         if oElemento.Inserir then
          EnviarParaHTML('{"acao":"ok","msg":"Elemento inserido com sucesso!"}')
        else
          EnviarParaHTML('{"acao":"erro","msg":"Falha ao inserir."}');
      finally
        oElemento.Free;
      end;
    end

    else if sEntidade = 'grupo' then
    begin
      oGrupo := TGrupo.Create(dtmPrincipal.ConexaoDB);
      try
        TGrupo.descricao := aJSON.GetValue<string>('descricao');

        if oGrupo.Inserir then
          EnviarParaHTML('{"acao":"ok","msg":"Grupo inserido com sucesso!"}')
        else
          EnviarParaHTML('{"acao":"erro","msg":"Falha ao inserir."}');
      finally
        oGrupo.Free;
      end;
    end

    else if sEntidade = 'periodo' then
    begin
      oPeriodo := TPeriodo.Create(dtmPrincipal.ConexaoDB);
      try
        TPeriodo.descricao := aJSON.GetValue<string>('descricao');

        if oPeriodo.Inserir then
          EnviarParaHTML('{"acao":"ok","msg":"Periodo inserido com sucesso!"}')
        else
          EnviarParaHTML('{"acao":"erro","msg":"Falha ao inserir."}');
      finally
        oPeriodo.Free;
      end;
    end

    else if sEntidade = 'familia' then
    begin
      oFamilia := TFamilia.Create(dtmPrincipal.ConexaoDB);
      try
        TFamilia.descricao := aJSON.GetValue<string>('descricao');

        if oFamilia.Inserir then
          EnviarParaHTML('{"acao":"ok","msg":"Família inserida com sucesso!"}')
        else
          EnviarParaHTML('{"acao":"erro","msg":"Falha ao inserir."}');
      finally
        oFamilia.Free;
      end;
    end

    else if sEntidade = 'categoria_quimica' then
    begin
      oCategoria := TCategoriaQuimica.Create(dtmPrincipal.ConexaoDB);
      try
        TCategoriaQuimica.descricao := aJSON.GetValue<string>('descricao');

        if oCategoria.Inserir then
          EnviarParaHTML('{"acao":"ok","msg":"Grupo inserido com sucesso!"}')
        else
          EnviarParaHTML('{"acao":"erro","msg":"Falha ao inserir."}');
      finally
        oCategoria.Free;
      end;
    end;
  end

  else if sAcao = 'atualizar' then
  begin

  end
end;
{$ENDREGION}
end.
