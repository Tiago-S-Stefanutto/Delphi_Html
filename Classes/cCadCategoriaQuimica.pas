unit cCadCategoriaQuimica;

interface

uses
  System.SysUtils, FireDAC.Comp.Client, FireDAC.Stan.Param, Data.DB;

type
  TCategoriaQuimica = class
    private
      ConexaoDB: TFDConnection;
      F_categoriaId: Integer;
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
      property codigo: Integer read F_categoriaId write F_categoriaId;
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

function TCategoriaQuimica.ExisteDescricao: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Text :=
      ' SELECT 1 ' +
      ' FROM categoria_quimica ' +
      ' WHERE descricao = :descricao ';

    Qry.ParamByName('descricao').AsString := Self.F_descricao;

    Qry.Open;

    Result := not Qry.IsEmpty;

  finally
    Qry.Free;
  end;
end;

function TCategoriaQuimica.ExisteDescricaoUpdate: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Text := ' SELECT descricao ' +
                    ' FROM categoria_quimica ' +
                    ' WHERE descricao = :descricao ' +
                    '   AND categoria_quimicaId <> :categoria_quimicaId ';

    Qry.ParamByName('categoria_quimicaId').AsInteger := Self.F_categoriaId;
    Qry.ParamByName('descricao').AsString := Self.F_descricao;

    Qry.Open;

    Result := not Qry.IsEmpty;

  finally
    Qry.Free;
  end;
end;

function TCategoriaQuimica.Inserir: Boolean;
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
      Qry.SQL.Add(' INSERT INTO categoria_quimica (descricao) '+
                  ' OUTPUT INSERTED.categoria_quimicaId '+
                  ' VALUES (:descricao) ');

      Qry.ParamByName('descricao').AsString := F_descricao;

      Qry.Open;
      F_categoriaId := Qry.Fields[0].AsInteger;

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

  if ExisteDescricaoUpdate then
  raise Exception.Create('Descrição já cadastrada.');

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' UPDATE categoria_quimica '+
                  '    SET descricao = :descricao '+
                  '  WHERE categoria_quimicaId = :categoria_quimicaId ');

      Qry.ParamByName('descricao').AsString := F_descricao;
      Qry.ParamByName('categoria_quimicaId').AsInteger := F_categoriaId;

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

    try
    Qry.SQL.Clear;
      Qry.SQL.Add(' SELECT COUNT(*) AS TOTAL'+
                  ' FROM elemento'+
                  ' WHERE categoria_quimica_id =:categoria_quimicaId');

      Qry.ParamByName('categoria_quimicaId').AsInteger := F_categoriaId;
      Qry.Open;

      if Qry.FieldByName('TOTAL').AsInteger > 0 then
      raise Exception.Create(
      'Não é possível excluir este periodo pois existem elementos vinculados.');

      ConexaoDB.StartTransaction;

      Qry.SQL.Clear;
      Qry.SQL.Add(' DELETE FROM categoria_quimica '+
                  ' WHERE categoria_quimicaId = :id ');

      Qry.ParamByName('id').AsInteger := F_categoriaId;

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
