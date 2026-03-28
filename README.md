# Orbit Scientific Calculator

A responsive scientific calculator built as a static web app with:

- desktop and mobile friendly UI
- scientific functions and constants
- calculation history and memory controls
- voice input powered by a shared parser/evaluator module
- installable PWA support
- a browser-based voice parser regression test page

## Project Files

- `index.html`: app structure
- `styles.css`: responsive layout and visual design
- `script.js`: calculator logic, voice parsing, editing, and UI behavior
- `voice-math.js`: shared spoken-math parser and evaluator
- `voice-parser-cases.js`: reusable voice test matrix
- `voice-parser-tests.html`: in-browser regression harness for voice parsing
- `sw.js`: service worker for offline support and update handling
- `manifest.json`: PWA manifest
- `icons/icon.svg`: app icon

## Run Locally

Open `index.html` in a browser, or serve the folder from any static host.

For the best PWA and service-worker behavior, use a hosted URL instead of opening the file directly.

## Deploy

### GitHub + Vercel

1. Commit and push:

```bash
git add .
git commit -m "Update Orbit calculator"
git push
```

2. If the repo is already connected to Vercel, deployment starts automatically.
3. Open the Vercel deployment and wait for `Ready`.

### Netlify

1. Go to `https://app.netlify.com/drop`
2. Drag the project folder into the page
3. Use the generated URL

## Voice Input

Voice input works best in Chromium-based browsers that support the Web Speech API.

The parser and evaluator are centralized in `voice-math.js`, so typed and spoken scientific expressions do not rely on scattered one-off replacements anymore.

The small voice debug area stays hidden until there is actual transcript or parsed content to show.

## Voice Regression Harness

Open `voice-parser-tests.html` in a browser to run the shared parser against a fixed matrix of phrases.

It covers:

- arithmetic
- percentages
- powers
- roots
- logs
- trig and inverse trig
- spoken-number phrases
- punctuation cleanup
- expected parse failures

Use this page after parser changes before you redeploy the main app.

## PWA / Cache Notes

- The app uses a service worker for offline support
- `voice-math.js` and the voice test assets are also cached by the service worker
- After a redeploy, a refresh may be needed once to load the newest version
- If the UI says an update is available, refresh the page
- If an installed mobile app still looks stale, close and reopen it after refresh

## Quick Test Checklist

### Core Math

- `2 + 3 = 5`
- `9 / 3 = 3`
- `sqrt(81) = 9`
- `log(100) = 2`
- `ln(e) = 1`
- `5! = 120`
- `17% of 330 = 56.1`

### Trig

- in `DEG` mode: `sin 30 = 0.5`
- in `DEG` mode: `cos 60 = 0.5`
- in `DEG` mode: `tan 45 = 1`
- `asin 0.5 = 30` in `DEG`

### Voice

Test these spoken phrases:

- `log 25`
- `natural log 10`
- `tan 45`
- `cosine 60`
- `seventeen percent of three hundred thirty`
- `square root of eighty one`

Check that:

- the debug row only appears when there is real voice content
- the transcript shows the browser transcript when voice input is used
- the parser produces a valid calculator expression
- the result appears in the main result area

Also open `voice-parser-tests.html` and confirm the matrix passes before shipping parser changes.

### Editing

- Tap `Edit`
- place the cursor in the middle of the expression
- type manually
- use `Delete`
- press `Enter`

### Mobile

- keypad order is sensible in portrait view
- result stays prominent and readable
- edit buttons remain tappable
- history panel moves below the calculator

### Desktop

- keyboard shortcuts work when not editing
- keyboard shortcuts do not interfere while editing
- shortcuts panel toggles correctly
- voice button and parsed debug line remain visible

## Known Practical Limits

- Voice quality depends on the browser speech engine
- Some trig functions are undefined for certain inputs and should show `Error`
- Browser caching can make an old build appear briefly until refresh
- The browser test harness verifies parsing and evaluation logic, but it does not replace live microphone testing on target devices
