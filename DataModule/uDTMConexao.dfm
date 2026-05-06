object dtmPrincipal: TdtmPrincipal
  Left = 0
  Top = 0
  BorderStyle = bsNone
  ClientHeight = 350
  ClientWidth = 404
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  PixelsPerInch = 96
  TextHeight = 13
  object ConexaoDB: TFDConnection
    Params.Strings = (
      'Server=DC-TR-02-VM\SERVERCURSO'
      'Database=Quimica'
      'OSAuthent=Yes'
      'DriverID=MSSQL'
      'User_Name=DOMTEC\devmv'
      'Connected=True')
    Connected = True
    Left = 184
    Top = 160
  end
end
