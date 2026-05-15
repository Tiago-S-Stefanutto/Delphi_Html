unit cCadPeriodo;

interface

uses
  System.SysUtils, FireDAC.Comp.Client, FireDAC.Stan.Param, Data.DB;

type
  TPeriodo = class
    private
      ConexaoDB: TFDConnection;
      F_periodoId: Integer;
      F_descricao: string;
    function ExisteDescricao: Boolean;
    function ExisteDescricaoUpdate: Boolean;

    public
      constructor Create(aConexao: TFDConnection);
      destructor Destroy; override;

      function Inserir: Boolean;
      function Atualizar: Boolean;
      function Apagar: Boolean;

    published
      property codigo: Integer read F_periodoId write F_periodoId;
      property descricao: string read F_descricao write F_descricao;

      end;

implementation

{$region 'Constructor and Destructor'}
  constructor TPeriodo.Create(aConexao: TFDConnection);
  begin
    ConexaoDB:=aConexao;
  end;

  destructor TPeriodo.Destroy;
  begin
    inherited;
  end;
{$endRegion}

{ TPeriodo }

function TPeriodo.ExisteDescricao: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Text :=
      ' SELECT 1 ' +
      ' FROM periodo ' +
      ' WHERE descricao = :descricao ';

    Qry.ParamByName('descricao').AsString := Self.F_descricao;

    Qry.Open;

    Result := not Qry.IsEmpty;

  finally
    Qry.Free;
  end;
end;

function TPeriodo.ExisteDescricaoUpdate: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Text := ' SELECT descricao ' +
                    ' FROM periodo ' +
                    ' WHERE descricao = :descricao ' +
                    '   AND periodoId <> :periodoId ';

    Qry.ParamByName('periodoId').AsInteger := Self.F_periodoId;
    Qry.ParamByName('descricao').AsString := Self.F_descricao;

    Qry.Open;

    Result := not Qry.IsEmpty;

  finally
    Qry.Free;
  end;
end;

function TPeriodo.Inserir: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  if ExisteDescricao then
  raise Exception.Create('Descrição já cadastrada.');

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' INSERT INTO periodo (descricao) '+
                  ' OUTPUT INSERTED.periodoId '+
                  ' VALUES (:descricao) ');

      Qry.ParamByName('descricao').AsString := F_descricao;

      Qry.Open;
      F_periodoId := Qry.Fields[0].AsInteger;

      ConexaoDB.Commit;
      Result := True;

    except
      ConexaoDB.Rollback;
      raise;
    end;

  finally
    Qry.Free;
  end;
end;

function TPeriodo.Atualizar: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  if ExisteDescricao then
  raise Exception.Create('Descrição já cadastrada.');

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' UPDATE periodo '+
                  '    SET descricao = :descricao '+
                  '  WHERE periodoId = :id ');

      Qry.ParamByName('descricao').AsString := F_descricao;
      Qry.ParamByName('id').AsInteger := F_periodoId;

      Qry.ExecSQL;

      ConexaoDB.Commit;
      Result := True;

    except
      ConexaoDB.Rollback;
      raise;
    end;

  finally
    Qry.Free;
  end;
end;

function TPeriodo.Apagar: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;
  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' SELECT COUNT(*) AS TOTAL'+
                  ' FROM elemento'+
                  ' WHERE periodo_id =:periodoId');

      Qry.ParamByName('periodoId').AsInteger := F_periodoId;
      Qry.Open;

      if Qry.FieldByName('TOTAL').AsInteger > 0 then
      raise Exception.Create(
      'Não é possível excluir este periodo pois existem elementos vinculados.');

      Qry.Close;

      ConexaoDB.StartTransaction;

      Qry.SQL.Clear;
      Qry.SQL.Add(' DELETE FROM periodo '+
                  ' WHERE periodoId = :id ');

      Qry.ParamByName('id').AsInteger := F_periodoId;

      Qry.ExecSQL;

      ConexaoDB.Commit;
      Result := True;

    except
      ConexaoDB.Rollback;
      raise;
    end;

  finally
    Qry.Free;
  end;
end;

end.
