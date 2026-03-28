# Orbit Scientific Calculator

A fresh rebuild of the calculator with:

- a new responsive UI for desktop and mobile
- one shared expression language for typed input and voice input
- a simpler math engine in `voice-math.js`
- memory controls and history
- built-in verification pages for engine tests, voice parser tests, and manual feature checks

## Core Files

- `index.html`: main calculator UI
- `styles.css`: responsive visual design
- `script.js`: app state, keypad logic, edit mode, history, memory, and voice interaction
- `voice-math.js`: shared expression evaluator and spoken-math parser
- `package.json`: Capacitor/mobile packaging dependencies and scripts
- `capacitor.config.json`: Capacitor app configuration

## Verification Files

- `calculator-test-cases.js`: engine regression cases
- `calculator-tests.html`: in-browser engine test page
- `voice-parser-cases.js`: spoken phrase regression cases
- `voice-parser-tests.html`: in-browser voice parser test page
- `feature-checklist.html`: manual desktop/mobile verification checklist
- `MOBILE_APP_GUIDE.md`: full Android/iOS setup and deployment walkthrough

## How To Run

Open `index.html` in a browser, or deploy the folder to Vercel/Netlify as a static site.

## How To Test

Use this order:

1. Open `calculator-tests.html`
2. Open `voice-parser-tests.html`
3. Use `feature-checklist.html`
4. Then test the live app with real voice input on desktop and mobile

## Deployment

Push changes and let Vercel redeploy:

```bash
git add .
git commit -m "Rebuild scientific calculator"
git push
```

## Mobile App Packaging

This project is prepared for Capacitor-based app packaging.

Start with:

1. Install Node.js
2. Install Java + Android Studio
3. Run `npm install`
4. Follow [MOBILE_APP_GUIDE.md](C:\Users\anish\OneDrive\Documents\New%20project\MOBILE_APP_GUIDE.md)

## Notes

- Voice input depends on browser speech recognition support
- Very large powers can overflow and should show `Overflow`
- This rebuild intentionally avoids the previous service-worker-heavy path so fresh deploys are easier to verify
