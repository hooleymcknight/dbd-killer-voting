REM   Attempt to set the execution policy by using PowerShell version 2.0 syntax.
REM   PowerShell -Version 2.0 -ExecutionPolicy Unrestricted D:\path\to\file\start-bots.ps1 >> "%TEMP%\StartupLog.txt" 2>&1

REM   If PowerShell version 2.0 isn't available. Set the execution policy by using the PowerShell
REM   IF %ERRORLEVEL% EQU -393216 (
   PowerShell -Command "Set-ExecutionPolicy Unrestricted" >> "%TEMP%\StartupLog.txt" 2>&1
   PowerShell D:\path\to\file\start-bots.ps1 >> "%TEMP%\StartupLog.txt" 2>&1
REM   )

REM   If an error occurred, return the errorlevel.
EXIT /B %errorlevel%