@echo off
title VORA VISTORIA - TESTE LOCAL
color 0B
cd /d "%~dp0"

echo ======================================================
echo   VORA VISTORIA - SISTEMA DE VISTORIA VEICULAR
echo   [PREPARANDO AMBIENTE DE TESTE LOCAL]
echo ======================================================
echo.

rem Verifica se o Node.js esta instalado
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado! Por favor, instale o Node.js antes de continuar.
    echo Acesse: https://nodejs.org/
    pause
    exit /b
)

rem Instala dependencias se a pasta node_modules nao existir
if not exist node_modules (
    echo [1/3] Instalando dependencias [isso pode levar um minuto]...
    call npm install
) else (
    echo [1/3] Dependencias ja instaladas.
)
echo.

rem Compila o frontend
echo [2/3] Compilando a aplicacao Frontend (Vite)...
call npm run build
echo.

rem Abre o navegador e inicia o servidor Express
echo [3/3] Iniciando o servidor de Banco de Dados Local...
echo.
echo   ======================================================
echo     A aplicacao sera aberta no seu navegador em breve.
echo     URL Local: http://localhost:3000
echo.
echo     Para testar no celular (conectado no mesmo Wi-Fi):
    setlocal enabledelayedexpansion
    for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4"') do (
        set "ip=%%i"
        set "ip=!ip: =!"
        if not "!ip!"=="" (
            echo       ➜ http://!ip!:3000
        )
    )
    endlocal
echo.
echo     Para encerrar o servidor, feche esta janela do CMD.
echo   ======================================================
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

node server.js
pause
