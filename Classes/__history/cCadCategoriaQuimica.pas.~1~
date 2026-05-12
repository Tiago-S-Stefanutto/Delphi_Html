unit cCadCategoriaQuimica;

interface

uses
  System.SysUtils, FireDAC.Comp.Client, FireDAC.Stan.Param, Data.DB;

type
  TCategoriaQuimica = class
    private
      ConexaoDB: TFDConnection;
      F_id: Integer;
      F_descricao: string;

    public
      constructor Create(aConexao: TFDConnection);
      destructor Destroy; override;

      function Inserir: Boolean;
      function Atualizar: Boolean;
      function Apagar: Boolean;
      function Selecionar(id: Integer): Boolean;

    published
      property codigo: Integer read F_id write F_id;
      property descricao: string read F_descricao write F_descricao;

end;

implementation

{$region 'Constructor and Destructor'}
  constructor TCategoriaQuimica.Create(aConexao: TFDConnection);
  begin
    ConexaoDB:=aConexao;
  end;

  destructor TCategoriaQuimica.Destroy;
  begin
    inherited;
  end;
{$endRegion}

{ TCategoriaQuimica }

function TCategoriaQuimica.Inserir: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;
  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' INSERT INTO categoria_quimica (descricao) '+
                  ' OUTPUT INSERTED.categoria_quimicaId '+
                  ' VALUES (:descricao) ');

      Qry.ParamByName('descricao').AsString := F_descricao;

      Qry.Open;
      F_id := Qry.Fields[0].AsInteger;

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

function TCategoriaQuimica.Atualizar: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;
  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' UPDATE categoria_quimica '+
                  '    SET descricao = :descricao '+
                  '  WHERE categoria_quimicaId = :id ');

      Qry.ParamByName('descricao').AsString := F_descricao;
      Qry.ParamByName('id').AsInteger := F_id;

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

function TCategoriaQuimica.Apagar: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;
  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' DELETE FROM categoria_quimica '+
                  ' WHERE categoria_quimicaId = :id ');

      Qry.ParamByName('id').AsInteger := F_id;

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

function TCategoriaQuimica.Selecionar(id: Integer): Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;
  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Clear;
    Qry.SQL.Add(' SELECT categoria_quimicaId, descricao '+
                '   FROM categoria_quimica '+
                '  WHERE categoria_quimicaId = :id ');

    Qry.ParamByName('id').AsInteger := id;
    Qry.Open;

    if not Qry.IsEmpty then
    begin
      F_id := Qry.FieldByName('categoria_quimicaId').AsInteger;
      F_descricao := Qry.FieldByName('descricao').AsString;
      Result := True;
    end;

  finally
    Qry.Free;
  end;
end;

end.
