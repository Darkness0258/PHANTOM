#define MyAppName "PHANTOM"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Darkness X"
#define MyAppURL "https://github.com/darkness-x"
#define MyAppExeName "phantom-core.exe"
#define PhantomDir "C:\workstation\Apps\Phantom"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\PHANTOM
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir={#PhantomDir}\installer\output
OutputBaseFilename=PHANTOM-Setup-v1.0.0
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
UninstallDisplayIcon={app}\phantom-core.exe
UninstallDisplayName=PHANTOM Network Guardian
MinVersion=10.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Core binaries
Source: "{#PhantomDir}\target\release\phantom-core.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PhantomDir}\target\release\phantom-agent.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PhantomDir}\nssm.exe"; DestDir: "{app}"; Flags: ignoreversion

; AI service
Source: "{#PhantomDir}\services\phantom-ai\server.py"; DestDir: "{app}\phantom-ai"; Flags: ignoreversion
Source: "{#PhantomDir}\services\phantom-ai\engine.py"; DestDir: "{app}\phantom-ai"; Flags: ignoreversion
Source: "{#PhantomDir}\services\phantom-ai\context.py"; DestDir: "{app}\phantom-ai"; Flags: ignoreversion
Source: "{#PhantomDir}\services\phantom-ai\memory.py"; DestDir: "{app}\phantom-ai"; Flags: ignoreversion
Source: "{#PhantomDir}\services\phantom-ai\config.py"; DestDir: "{app}\phantom-ai"; Flags: ignoreversion
Source: "{#PhantomDir}\services\phantom-ai\requirements.txt"; DestDir: "{app}\phantom-ai"; Flags: ignoreversion

; Config
Source: "{#PhantomDir}\services\phantom-core\config.default.toml"; DestDir: "{app}\data"; Flags: ignoreversion onlyifdoesntexist

; Mobile APK
Source: "{#PhantomDir}\apps\phantom-mobile\android\app\build\outputs\apk\release\app-release.apk"; DestDir: "{app}"; DestName: "PHANTOM-Mobile.apk"; Flags: ignoreversion

; Scripts
Source: "{#PhantomDir}\installer\phantom-start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PhantomDir}\installer\phantom-stop.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\PHANTOM Dashboard"; Filename: "{app}\phantom-start.bat"; IconFilename: "{app}\phantom-core.exe"
Name: "{group}\Stop PHANTOM"; Filename: "{app}\phantom-stop.bat"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\PHANTOM"; Filename: "{app}\phantom-start.bat"; IconFilename: "{app}\phantom-core.exe"; Tasks: desktopicon

[Run]
; Install phantom-core as Windows service
Filename: "{app}\nssm.exe"; Parameters: "install phantom-core ""{app}\phantom-core.exe"""; Flags: runhidden waituntilterminated; StatusMsg: "Installing phantom-core service..."
Filename: "{app}\nssm.exe"; Parameters: "set phantom-core AppDirectory ""{app}"""; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "set phantom-core Start SERVICE_AUTO_START"; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "set phantom-core AppStdout ""{app}\logs\core-stdout.log"""; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "set phantom-core AppStderr ""{app}\logs\core-stderr.log"""; Flags: runhidden waituntilterminated

; Install phantom-agent as Windows service
Filename: "{app}\nssm.exe"; Parameters: "install phantom-agent ""{app}\phantom-agent.exe"""; Flags: runhidden waituntilterminated; StatusMsg: "Installing phantom-agent service..."
Filename: "{app}\nssm.exe"; Parameters: "set phantom-agent AppDirectory ""{app}"""; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "set phantom-agent AppEnvironmentExtra ""PHANTOM_CORE_URL=http://localhost:8000"""; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "set phantom-agent Start SERVICE_AUTO_START"; Flags: runhidden waituntilterminated

; Start services
Filename: "{app}\nssm.exe"; Parameters: "start phantom-core"; Flags: runhidden waituntilterminated; StatusMsg: "Starting PHANTOM Core..."
Filename: "{app}\nssm.exe"; Parameters: "start phantom-agent"; Flags: runhidden waituntilterminated; StatusMsg: "Starting PHANTOM Agent..."

; Open dashboard in browser
Filename: "{app}\phantom-start.bat"; Description: "Launch PHANTOM Dashboard"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "{app}\nssm.exe"; Parameters: "stop phantom-core confirm"; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "stop phantom-agent confirm"; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "remove phantom-core confirm"; Flags: runhidden waituntilterminated
Filename: "{app}\nssm.exe"; Parameters: "remove phantom-agent confirm"; Flags: runhidden waituntilterminated

[Dirs]
Name: "{app}\logs"
Name: "{app}\data"
Name: "{app}\phantom-ai\models"

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    // Create logs directory
    ForceDirectories(ExpandConstant('{app}\logs'));
  end;
end;



