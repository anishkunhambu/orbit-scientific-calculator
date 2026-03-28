const expressionInput = document.getElementById("expression");
const resultOutput = document.getElementById("result");
const historyOutput = document.getElementById("history");
const modeIndicator = document.getElementById("mode-indicator");
const memoryIndicator = document.getElementById("memory-indicator");
const angleToggle = document.getElementById("angle-toggle");
const keyboard = document.querySelector(".keyboard");
const quickActions = document.querySelector(".quick-actions");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const shortcutToggle = document.getElementById("shortcut-toggle");
const shortcutPanel = document.getElementById("shortcut-panel");
const installButton = document.getElementById("install-app");
const voiceToggle = document.getElementById("voice-toggle");
const voiceStatus = document.getElementById("voice-status");
const voiceDebug = document.getElementById("voice-debug");
const voiceHeard = document.getElementById("voice-heard");
const voiceParsed = document.getElementById("voice-parsed");
const primaryResult = document.getElementById("primary-result");
const editToggle = document.getElementById("edit-toggle");
const displayDelete = document.getElementById("display-delete");
const displayClear = document.getElementById("display-clear");

let expression = "0";
let lastAnswer = 0;
let memoryValue = 0;
let isDegreeMode = false;
let deferredInstallPrompt = null;
const storageKey = "orbitScientificHistory";
const historyLimit = 10;
let calculationHistory = loadHistory();
let recognition = null;
let isListening = false;
let isEditMode = false;
let suspendedExpressionPreview = "";

const previewReplacements = [
  [/Math\.PI/g, "π"],
  [/Math\.E/g, "e"],
  [/Math\.sqrt\(/g, "sqrt("],
  [/Math\.sin\(/g, "sin("],
  [/Math\.cos\(/g, "cos("],
  [/Math\.tan\(/g, "tan("],
  [/cot\(/g, "cot("],
  [/sec\(/g, "sec("],
  [/csc\(/g, "csc("],
  [/Math\.asin\(/g, "asin("],
  [/Math\.acos\(/g, "acos("],
  [/Math\.atan\(/g, "atan("],
  [/acot\(/g, "acot("],
  [/asec\(/g, "asec("],
  [/acsc\(/g, "acsc("],
  [/Math\.log10\(/g, "log("],
  [/Math\.log\(/g, "ln("],
  [/Math\.exp\(/g, "exp("],
  [/Math\.abs\(/g, "abs("],
  [/Math\.random\(\)/g, "rand()"],
  [/factorial\(/g, "fact("],
  [/percent\(/g, "percent("],
  [/ans/g, "ans"]
];

const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

function updateDisplay(previewValue = null) {
  const formattedExpression = formatPreview(expression);
  expressionInput.value = isEditMode
    ? expression
    : formattedExpression === "0"
      ? ""
      : formattedExpression;
  const visibleResult = previewValue ?? formatNumber(lastAnswer);
  primaryResult.textContent = visibleResult;
  resultOutput.textContent = "";
  memoryIndicator.textContent = `Memory: ${formatNumber(memoryValue)}`;
  modeIndicator.textContent = isDegreeMode ? "Degrees" : "Radians";
  angleToggle.textContent = isDegreeMode ? "DEG" : "RAD";
  angleToggle.setAttribute("aria-pressed", String(isDegreeMode));
  editToggle.setAttribute("aria-pressed", String(isEditMode));
  editToggle.textContent = isEditMode ? "Done" : "Edit";
}

function setVoiceStatus(message) {
  voiceStatus.textContent = message;
}

function setVoiceDebug(heard = "", parsed = "") {
  const heardValue = (heard || "").trim();
  const parsedValue = (parsed || "").trim();

  voiceHeard.textContent = heardValue;
  voiceParsed.textContent = parsedValue;

  if (!heardValue && !parsedValue) {
    voiceDebug.hidden = true;
    return;
  }

  voiceDebug.hidden = false;
}

function resetVoiceResultState() {
  historyOutput.textContent = "";
  primaryResult.textContent = "";
  resultOutput.textContent = "";
  expressionInput.value = "";
}

function suspendCurrentPreview() {
  suspendedExpressionPreview = expressionInput.value;
  expressionInput.value = "";
}

function restoreSuspendedPreview() {
  expressionInput.value = suspendedExpressionPreview;
}

function clearSuspendedPreview() {
  suspendedExpressionPreview = "";
}

function setListeningState(listening) {
  isListening = listening;
  voiceToggle.setAttribute("aria-pressed", String(listening));
  voiceToggle.textContent = listening ? "Listening..." : "Voice Input";
}

function setEditMode(enabled) {
  isEditMode = enabled;
  expressionInput.readOnly = !enabled;
  expressionInput.inputMode = enabled ? "text" : "none";
  expressionInput.classList.toggle("is-editing", enabled);
  if (enabled) {
    updateDisplay(getPreviewValue());
    requestAnimationFrame(() => {
      expressionInput.focus();
      const cursor = expressionInput.value.length;
      expressionInput.setSelectionRange(cursor, cursor);
    });
    return;
  }
  expressionInput.blur();
  updateDisplay(getPreviewValue());
}

function formatPreview(value) {
  let preview = value;
  for (const [pattern, replacement] of previewReplacements) {
    preview = preview.replace(pattern, replacement);
  }
  return preview;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  const rounded = Number.parseFloat(value.toFixed(12));
  return rounded.toString();
}

function getPreviewValue() {
  const evaluated = tryEvaluate(expression);
  return evaluated.ok ? formatNumber(evaluated.value) : "";
}

function loadHistory() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(calculationHistory));
  } catch (error) {
    return;
  }
}

function renderHistory() {
  historyList.innerHTML = "";

  if (calculationHistory.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No calculations yet. Your recent results will appear here.";
    historyList.appendChild(emptyItem);
    return;
  }

  calculationHistory.forEach(entry => {
    const item = document.createElement("li");
    item.innerHTML = `
      <div class="history-entry">
        <span>${entry.expression}</span>
        <strong>${entry.result}</strong>
      </div>
      <small>${entry.timestamp}</small>
    `;
    historyList.appendChild(item);
  });
}

function addHistoryEntry(rawExpression, value) {
  const timestamp = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  calculationHistory.unshift({
    expression: formatPreview(rawExpression),
    result: formatNumber(value),
    timestamp
  });

  calculationHistory = calculationHistory.slice(0, historyLimit);
  saveHistory();
  renderHistory();
}

function normalizeExpression(value) {
  if (value === "0") {
    return "";
  }
  return value;
}

function appendToExpression(token) {
  const next = normalizeExpression(expression) + token;
  expression = next || "0";
  updateLivePreview();
}

function appendImplicitToken(token) {
  const base = normalizeExpression(expression);
  const shouldMultiply =
    base &&
    /(\d|\)|Math\.PI|Math\.E|ans)$/.test(base);

  expression = `${base}${shouldMultiply ? "*" : ""}${token}` || "0";
  updateLivePreview();
}

function wrapCurrentExpression(wrapper) {
  const base = expression === "0" ? "0" : expression;
  expression = wrapper(base);
  updateLivePreview();
}

function updateLivePreview() {
  const previewResult = tryEvaluate(expression);
  const normalized = (expression || "").trim();
  const isEmpty = normalized === "" || normalized === "0";
  const isIncomplete = /[\+\-\*\/\(]$/.test(normalized) || /\*\*$/.test(normalized);

  if (previewResult.ok) {
    updateDisplay(formatNumber(previewResult.value));
    return;
  }

  if (isEmpty) {
    updateDisplay(formatNumber(lastAnswer || 0));
    return;
  }

  if (isIncomplete) {
    updateDisplay("");
    return;
  }

  updateDisplay("Error");
}

function setExpression(nextExpression) {
  expression = nextExpression || "0";
  updateLivePreview();
}

function appendVoiceExpression(transcriptExpression, originalTranscript = "") {
  if (!transcriptExpression) {
    return;
  }

  const normalized = transcriptExpression.trim();
  if (normalized === "=") {
    commitResult();
    return;
  }

  if (normalized === "clear") {
    clearExpression();
    return;
  }

  const evaluated = tryEvaluate(normalized);
  setExpression(normalized);

  if (evaluated.ok) {
    commitResult();
    clearSuspendedPreview();
    if (originalTranscript) {
      historyOutput.textContent = `Voice: ${originalTranscript}`;
    }
    setVoiceStatus(`Result ready for: ${originalTranscript || formatPreview(normalized)}`);
    return;
  }

  historyOutput.textContent = originalTranscript
    ? `Voice heard: ${originalTranscript}`
    : "Voice input captured";
  primaryResult.textContent = "Error";
  resultOutput.textContent = "";
  setVoiceStatus(`Couldn't evaluate: ${originalTranscript || formatPreview(normalized)}`);
}

function tryEvaluate(rawExpression) {
  return window.VoiceMath.tryEvaluate(rawExpression, {
    lastAnswer,
    isDegreeMode
  });
}

function parseSpokenMath(transcript) {
  return window.VoiceMath.parseSpokenMath(transcript);
}

function initializeVoiceRecognition() {
  if (!SpeechRecognitionApi) {
    voiceToggle.disabled = true;
    setVoiceStatus("Voice input is not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognitionApi();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.addEventListener("start", () => {
    setListeningState(true);
    setVoiceStatus("Listening for a math expression...");
    setVoiceDebug();
    suspendCurrentPreview();
    resetVoiceResultState();
  });

  recognition.addEventListener("result", event => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(" ");

    const parsedExpression = parseSpokenMath(transcript);
    setVoiceDebug(transcript, parsedExpression);
    if (!parsedExpression) {
      resetVoiceResultState();
      historyOutput.textContent = `Voice heard: ${transcript}`;
      setVoiceStatus(`Couldn't parse: "${transcript}"`);
      return;
    }

    appendVoiceExpression(parsedExpression, transcript);
  });

  recognition.addEventListener("error", event => {
    setVoiceStatus(`Voice input error: ${event.error}`);
    resetVoiceResultState();
    if (event.error === "no-speech") {
      setVoiceDebug();
    }
  });

  recognition.addEventListener("end", () => {
    setListeningState(false);
    if (!primaryResult.textContent && !historyOutput.textContent) {
      restoreSuspendedPreview();
    } else {
      clearSuspendedPreview();
    }
  });
}

function commitResult() {
  const evaluated = tryEvaluate(expression);
  if (!evaluated.ok) {
    primaryResult.textContent = "Error";
    resultOutput.textContent = "Error";
    historyOutput.textContent = "Invalid expression";
    return;
  }

  lastAnswer = evaluated.value;
  addHistoryEntry(expression, evaluated.value);
  historyOutput.textContent = `${formatPreview(expression)} =`;
  expression = formatNumber(evaluated.value);
  updateDisplay(formatNumber(evaluated.value));
}

function handleFunction(fnName) {
  const functionMap = {
    sin: value => `safeTrig("sin", ${value})`,
    cos: value => `safeTrig("cos", ${value})`,
    tan: value => `safeTrig("tan", ${value})`,
    asin: value => `safeTrig("asin", ${value})`,
    acos: value => `safeTrig("acos", ${value})`,
    atan: value => `safeTrig("atan", ${value})`,
    ln: value => `Math.log(${value})`,
    log: value => `Math.log10(${value})`,
    exp: value => `Math.exp(${value})`,
    sqrt: value => `Math.sqrt(${value})`,
    square: value => `((${value})**2)`,
    inverse: value => `(1/(${value}))`,
    abs: value => `Math.abs(${value})`,
    pow: value => `((${value})**)`,
    percent: value => `percent(${value})`,
    factorial: value => `factorial(${value})`,
    rand: () => "Math.random()"
  };

  const builder = functionMap[fnName];
  if (!builder) {
    return;
  }

  if (fnName === "pow") {
    setExpression(builder(expression === "0" ? "0" : expression));
    return;
  }

  if (fnName === "rand") {
    appendImplicitToken(builder());
    return;
  }

  wrapCurrentExpression(builder);
}

function toggleSign() {
  wrapCurrentExpression(value => `(-1*(${value}))`);
}

function backspace() {
  const trimmed = expression.slice(0, -1);
  expression = trimmed || "0";
  updateLivePreview();
}

function deleteFromExpressionInput() {
  const start = expressionInput.selectionStart ?? expression.length;
  const end = expressionInput.selectionEnd ?? expression.length;

  if (start !== end) {
    expression = `${expression.slice(0, start)}${expression.slice(end)}` || "0";
    updateLivePreview();
    requestAnimationFrame(() => expressionInput.setSelectionRange(start, start));
    return;
  }

  if (start <= 0) {
    return;
  }

  expression = `${expression.slice(0, start - 1)}${expression.slice(start)}` || "0";
  updateLivePreview();
  requestAnimationFrame(() => expressionInput.setSelectionRange(start - 1, start - 1));
}

function clearExpression() {
  expression = "0";
  historyOutput.textContent = "";
  clearSuspendedPreview();
  setVoiceDebug();
  updateDisplay("0");
}

function updateMemory(action) {
  const current = tryEvaluate(expression);
  const currentValue = current.ok ? current.value : lastAnswer;

  if (action === "mc") {
    memoryValue = 0;
  } else if (action === "mr") {
    appendImplicitToken(formatNumber(memoryValue));
    return;
  } else if (action === "mplus") {
    memoryValue += currentValue;
  } else if (action === "mminus") {
    memoryValue -= currentValue;
  } else if (action === "ans") {
    appendImplicitToken("ans");
    return;
  }

  updateDisplay(getPreviewValue());
}

keyboard.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const { value, action, fn, constant } = button.dataset;

  if (value) {
    if (value === "(") {
      appendImplicitToken(value);
      return;
    }
    appendToExpression(value);
    return;
  }

  if (constant === "pi") {
    appendImplicitToken("Math.PI");
    return;
  }

  if (constant === "e") {
    appendImplicitToken("Math.E");
    return;
  }

  if (action === "clear") {
    clearExpression();
    return;
  }

  if (action === "delete") {
    backspace();
    return;
  }

  if (action === "negate") {
    toggleSign();
    return;
  }

  if (action === "equals") {
    commitResult();
    return;
  }

  if (fn) {
    handleFunction(fn);
  }
});

quickActions.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  updateMemory(button.dataset.action);
});

angleToggle.addEventListener("click", () => {
  isDegreeMode = !isDegreeMode;
  updateLivePreview();
});

clearHistoryButton.addEventListener("click", () => {
  calculationHistory = [];
  saveHistory();
  renderHistory();
});

shortcutToggle.addEventListener("click", () => {
  const isHidden = shortcutPanel.hasAttribute("hidden");
  if (isHidden) {
    shortcutPanel.removeAttribute("hidden");
    shortcutToggle.textContent = "Hide";
    shortcutToggle.setAttribute("aria-expanded", "true");
    return;
  }

  shortcutPanel.setAttribute("hidden", "");
  shortcutToggle.textContent = "Show";
  shortcutToggle.setAttribute("aria-expanded", "false");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

voiceToggle.addEventListener("click", () => {
  if (!recognition) {
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  recognition.start();
});

editToggle.addEventListener("click", () => {
  setEditMode(!isEditMode);
});

displayDelete.addEventListener("click", () => {
  if (isEditMode) {
    deleteFromExpressionInput();
  } else {
    backspace();
  }
  if (isEditMode) {
    expressionInput.focus();
  }
});

displayClear.addEventListener("click", () => {
  clearExpression();
  if (isEditMode) {
    expressionInput.focus();
  }
});

expressionInput.addEventListener("input", event => {
  if (!isEditMode) {
    return;
  }
  expression = event.target.value.trim() || "0";
  updateLivePreview();
});

expressionInput.addEventListener("keydown", event => {
  if (!isEditMode) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    commitResult();
    setEditMode(false);
  }
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("keydown", event => {
  if (isEditMode || event.target === expressionInput) {
    return;
  }

  const allowedKeys = "0123456789+-*/().";
  if (allowedKeys.includes(event.key)) {
    appendToExpression(event.key);
    return;
  }

  if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    commitResult();
    return;
  }

  if (event.key === "Backspace") {
    backspace();
    return;
  }

  if (event.key === "Delete" || event.key.toLowerCase() === "c") {
    clearExpression();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then(registration => {
      registration.update();

      if (registration.waiting) {
        setVoiceStatus("Update available. Refresh once for the newest version.");
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) {
          return;
        }

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setVoiceStatus("App updated. Refresh once to load the latest build.");
          }
        });
      });
    }).catch(() => {
      historyOutput.textContent = historyOutput.textContent || "Service worker registration failed.";
    });
  });
}

initializeVoiceRecognition();
renderHistory();
setVoiceDebug();
updateDisplay("0");
