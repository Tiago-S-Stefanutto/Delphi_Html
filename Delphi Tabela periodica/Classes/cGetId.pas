unit cGetId;

interface

uses
  System.SysUtils,
  FireDAC.Comp.Client;

type
  TGetID = class
  private
    ConexaoDB: TFDConnection;

    function GetOuCriarID(
      const ATabela: string;
      const ACampoID: string;
      const ADescricao: string
    ): Integer;

  public
    constructor Create(AConexao: TFDConnection);

    function GetGrupoID(const ADescricao: string): Integer;
    function GetPeriodoID(const ADescricao: string): Integer;
    function GetFamiliaID(const ADescricao: string): Integer;
    function GetCategoriaID(const ADescricao: string): Integer;
  end;

implementation

{ TGetID }

constructor TGetID.Create(AConexao: TFDConnection);
begin
  ConexaoDB:=aConexao;
end;

function TGetID.GetOuCriarID(
  const ATabela: string;
  const ACampoID: string;
  const ADescricao: string
): Integer;
var
  Qry: TFDQuery;
begin
  Result := -1;

  if Trim(ADescricao) = '' then
    Exit;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    // procura
    Qry.SQL.Clear;
    Qry.SQL.Add('SELECT ' + ACampoID);
    Qry.SQL.Add('FROM ' + ATabela);
    Qry.SQL.Add('WHERE descricao = :descricao');

    Qry.ParamByName('descricao').AsString := Trim(ADescricao);

    Qry.Open;

    if not Qry.IsEmpty then
    begin
      Result := Qry.Fields[0].AsInteger;
      Exit;
    end;

    Qry.Close;
    Qry.SQL.Clear;
    Qry.SQL.Add('INSERT INTO ' + ATabela + ' (descricao)');
    Qry.SQL.Add('VALUES (:descricao);');
    Qry.SQL.Add('SELECT SCOPE_IDENTITY() AS ID;');

    Qry.ParamByName('descricao').AsString := Trim(ADescricao);

    Qry.Open;

    Result := Qry.FieldByName('ID').AsInteger;

  finally
    Qry.Free;
  end;
end;

function TGetID.GetGrupoID(const ADescricao: string): Integer;
begin
  Result := GetOuCriarID(
    'grupo',
    'grupoId',
    ADescricao
  );
end;

function TGetID.GetPeriodoID(const ADescricao: string): Integer;
begin
  Result := GetOuCriarID(
    'periodo',
    'periodoId',
    ADescricao
  );
end;

function TGetID.GetFamiliaID(const ADescricao: string): Integer;
begin
  Result := GetOuCriarID(
    'familia',
    'familiaId',
    ADescricao
  );
end;

function TGetID.GetCategoriaID(const ADescricao: string): Integer;
begin
  Result := GetOuCriarID(
    'categoria_quimica',
    'categoria_quimicaId',
    ADescricao
  );
end;

end.
