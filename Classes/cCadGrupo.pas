unit cCadGrupo;

interface

uses
  System.Classes, Vcl.Controls, Vcl.ExtCtrls, Vcl.Dialogs, FireDAC.Stan.Intf, FireDAC.Stan.Option, FireDAC.Stan.Error, FireDAC.UI.Intf,
  FireDAC.Phys.Intf, FireDAC.Stan.Def, FireDAC.Stan.Pool, FireDAC.Stan.Async, FireDAC.Phys, FireDAC.Phys.MSSQL,
  FireDAC.Phys.MSSQLDef, FireDAC.VCLUI.Wait, Data.DB, FireDAC.Comp.Client, System.SysUtils, FireDAC.Stan.Param;

type
  TGrupo = class

    private
      ConexaoDB : TFDconnection;
      F_grupoId : integer;
      F_descricao : string;
    function ExisteDescricao: Boolean;
    function ExisteDescricaoUpdate: Boolean;

    public
      constructor Create(aConexao: TFDConnection);
      destructor  Destroy; override;

      function Inserir:Boolean;
      function Atualizar:Boolean;
      function Apagar:Boolean;

    published
      property codigo       : integer read F_grupoId        write F_grupoId;
      property descricao    : string  read F_descricao      write F_descricao;

end;

implementation

{$region 'Constructor and Destructor'}
  constructor TGrupo.Create(aConexao: TFDConnection);
  begin
    ConexaoDB:=aConexao;
  end;

  destructor TGrupo.Destroy;
  begin
    inherited;
  end;
{$endRegion}

{ TGrupo }

function TGrupo.ExisteDescricao: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Text :=
      ' SELECT 1 ' +
      ' FROM grupo ' +
      ' WHERE descricao = :descricao ';

    Qry.ParamByName('descricao').AsString := Self.F_descricao;

    Qry.Open;

    Result := not Qry.IsEmpty;

  finally
    Qry.Free;
  end;
end;

function TGrupo.ExisteDescricaoUpdate: Boolean;
var
  Qry: TFDQuery;
begin
  Result := False;

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    Qry.SQL.Text := ' SELECT descricao ' +
                    ' FROM grupo ' +
                    ' WHERE descricao = :descricao ' +
                    '   AND grupoId <> :grupoId ';

    Qry.ParamByName('grupoId').AsInteger := Self.F_grupoId;
    Qry.ParamByName('descricao').AsString := Self.F_descricao;

    Qry.Open;

    Result := not Qry.IsEmpty;

  finally
    Qry.Free;
  end;
end;

function TGrupo.Apagar: Boolean;
var
  Qry:TFDQuery;
begin
  Result := False;
  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection := ConexaoDB;

    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' SELECT COUNT(*) AS TOTAL'+
                  ' FROM elemento'+
                  ' WHERE grupo_id =:grupoId');

      Qry.ParamByName('grupoId').AsInteger := F_grupoId;
      Qry.Open;

      if Qry.FieldByName('TOTAL').AsInteger > 0 then
      raise Exception.Create(
      'Não é possível excluir este grupo pois existem elementos vinculados.');

      Qry.Close;

      ConexaoDB.StartTransaction;

      Qry.SQL.Clear;
      Qry.SQL.Add('DELETE FROM grupo ' +
                  'WHERE grupoId = :grupoId');

      Qry.ParamByName('grupoId').AsInteger := F_grupoId;

      Qry.ExecSQL;

      ConexaoDB.Commit;
      Result := True;

    except
      on E: Exception do
      begin
        ConexaoDB.Rollback;
        raise Exception.Create('Erro ao excluir Grupo: ' + E.Message);
      end;
    end;

  finally
    Qry.Free;
  end;
end;

function TGrupo.Atualizar: Boolean;
var Qry:TFDQuery;
begin
  Result:=true;

  if ExisteDescricaoUpdate then
  raise Exception.Create('Descrição já cadastrada.');

  Qry:=TFDQuery.Create(nil);
  Try
    Qry.Connection:=ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add('UPDATE grupo '+
                  '   SET descricao =:descricao '+
                  ' WHERE grupoId=:grupoId ');

      Qry.ParamByName('grupoId').AsInteger             :=Self.F_grupoId;
      Qry.ParamByName('descricao').AsString         :=Self.F_descricao;

      Qry.ExecSQL;

      ConexaoDB.Commit;

    except
      on E: Exception do
      begin
        ConexaoDB.Rollback;
        raise;
      end;
    end;

  finally
    if Assigned(Qry) then
       FreeAndNil(Qry);
  end;
end;

function TGrupo.Inserir: Boolean;
var
  Qry:TFDQuery;
begin
  Result := True;

  if ExisteDescricao then
  raise Exception.Create('Descrição já cadastrada.');

  Qry := TFDQuery.Create(nil);
  try
    Qry.Connection:=ConexaoDB;

    ConexaoDB.StartTransaction;
    try
      Qry.SQL.Clear;
      Qry.SQL.Add(' INSERT INTO grupo (descricao)'+
                  ' OUTPUT INSERTED.grupoId ' +
                  ' VALUES  (:descricao)');

      Qry.ParamByName('descricao').AsString        :=Self.F_descricao;

      Qry.Open;
      Self.F_grupoId := Qry.Fields[0].AsInteger;

      ConexaoDB.Commit;

    except
      on E: Exception do
      begin
        ConexaoDB.Rollback;
        raise;
      end;
    end;

  finally
    if Assigned(Qry) then
       FreeAndNil(Qry);
  end;
end;

end.
