@echo off
setlocal

if exist www rmdir /s /q www
mkdir www
mkdir www\icons

copy /Y index.html www\index.html >nul
copy /Y styles.css www\styles.css >nul
copy /Y script.js www\script.js >nul
copy /Y voice-math.js www\voice-math.js >nul
copy /Y manifest.json www\manifest.json >nul
copy /Y sw.js www\sw.js >nul
copy /Y calculator-tests.html www\calculator-tests.html >nul
copy /Y calculator-test-cases.js www\calculator-test-cases.js >nul
copy /Y voice-parser-tests.html www\voice-parser-tests.html >nul
copy /Y voice-parser-cases.js www\voice-parser-cases.js >nul
copy /Y feature-checklist.html www\feature-checklist.html >nul
copy /Y icons\icon.svg www\icons\icon.svg >nul

echo Web bundle copied to www\
