object frmPrincipal: TfrmPrincipal
  Left = 0
  Top = 0
  Align = alClient
  BorderStyle = bsNone
  Caption = 'frmPrincipal'
  ClientHeight = 405
  ClientWidth = 637
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  Position = poScreenCenter
  WindowState = wsMaximized
  OnClose = FormClose
  OnCreate = FormCreate
  OnDestroy = FormDestroy
  OnResize = FormResize
  PixelsPerInch = 96
  TextHeight = 13
  object WVWindowParent1: TWVWindowParent
    Left = 0
    Top = 0
    Width = 637
    Height = 405
    Align = alClient
    TabOrder = 0
  end
  object WVBrowser1: TWVBrowser
    TargetCompatibleBrowserVersion = '147.0.3912.50'
    AllowSingleSignOnUsingOSPrimaryAccount = False
    Left = 512
    Top = 32
  end
end
