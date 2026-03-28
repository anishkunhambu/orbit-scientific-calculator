const expressionInput = document.getElementById("expression-input");
const displayExpression = document.getElementById("display-expression");
const displayResult = document.getElementById("display-result");
const displayMeta = document.getElementById("display-meta");
const modeIndicator = document.getElementById("mode-indicator");
const memoryIndicator = document.getElementById("memory-indicator");
const angleToggle = document.getElementById("angle-toggle");
const voiceToggle = document.getElementById("voice-toggle");
const voiceStatus = document.getElementById("voice-status");
const voiceDebug = document.getElementById("voice-debug");
const voiceHeard = document.getElementById("voice-heard");
const voiceParsed = document.getElementById("voice-parsed");
const clearHistoryButton = document.getElementById("clear-history");
const historyList = document.getElementById("history-list");
const installButton = document.getElementById("install-app");
const editToggle = document.getElementById("edit-toggle");
const displayDelete = document.getElementById("display-delete");
const displayClear = document.getElementById("display-clear");
const keyboard = document.querySelector(".keyboard");
const memoryRow = document.querySelector(".memory-row");

const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
const HISTORY_KEY = "orbitScientificFreshHistory";

let expression = "";
let lastAnswer = 0;
let memoryValue = 0;
let isDegreeMode = false;
let isListening = false;
let isEditing = false;
let recognition = null;
let deferredInstallPrompt = null;
let historyEntries = loadHistory();

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyEntries.slice(0, 12)));
}

function renderHistory() {
  historyList.innerHTML = "";
  if (historyEntries.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No calculations yet.";
    historyList.appendChild(item);
    return;
  }

  historyEntries.forEach(entry => {
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

function setVoiceStatus(message) {
  voiceStatus.textContent = message;
}

function setVoiceDebug(heard = "", parsed = "") {
  voiceHeard.textContent = heard;
  voiceParsed.textContent = parsed;
  voiceDebug.hidden = !heard && !parsed;
}

function getEvaluationResult(targetExpression = expression) {
  return window.OrbitMath.evaluateExpression(targetExpression, {
    lastAnswer,
    isDegreeMode
  });
}

function formatExpression(targetExpression = expression) {
  return (targetExpression || "")
    .replace(/\bpi\b/g, "π")
    .replace(/\be\b/g, "e")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

function updateDisplay() {
  const evaluation = getEvaluationResult();
  expressionInput.value = expression;
  displayExpression.textContent = formatExpression(expression);
  displayResult.textContent = evaluation.ok ? window.OrbitMath.formatNumber(evaluation.value) : (expression ? "Error" : "0");
  displayMeta.textContent = evaluation.ok ? "" : (evaluation.message || "");
  modeIndicator.textContent = isDegreeMode ? "Degrees" : "Radians";
  memoryIndicator.textContent = `Memory: ${window.OrbitMath.formatNumber(memoryValue)}`;
  angleToggle.textContent = isDegreeMode ? "DEG" : "RAD";
  angleToggle.setAttribute("aria-pressed", String(isDegreeMode));
  editToggle.textContent = isEditing ? "Done" : "Edit";
  editToggle.setAttribute("aria-pressed", String(isEditing));
  expressionInput.readOnly = !isEditing;
  expressionInput.classList.toggle("is-editing", isEditing);
}

function addHistoryEntry(sourceExpression, resultValue) {
  historyEntries.unshift({
    expression: formatExpression(sourceExpression) || "0",
    result: window.OrbitMath.formatNumber(resultValue),
    timestamp: new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    })
  });
  historyEntries = historyEntries.slice(0, 12);
  saveHistory();
  renderHistory();
}

function appendToken(token) {
  const normalized = token === "(" && expression && /[\d)a-z]$/i.test(expression)
    ? `*${token}`
    : token;
  expression += normalized;
  updateDisplay();
}

function wrapExpression(kind) {
  const target = expression || "0";
  const wrappers = {
    sin: value => `sin(${value})`,
    cos: value => `cos(${value})`,
    tan: value => `tan(${value})`,
    asin: value => `asin(${value})`,
    acos: value => `acos(${value})`,
    atan: value => `atan(${value})`,
    log: value => `log(${value})`,
    ln: value => `ln(${value})`,
    sqrt: value => `sqrt(${value})`,
    abs: value => `abs(${value})`,
    cbrt: value => `cbrt(${value})`,
    exp: value => `exp(${value})`,
    fact: value => `fact(${value})`,
    percent: value => `percent(${value})`,
    inv: value => `(1/(${value}))`,
    pow2: value => `((${value})**2)`
  };
  expression = wrappers[kind](target);
  updateDisplay();
}

function clearAll() {
  expression = "";
  setVoiceDebug();
  setVoiceStatus("Ready");
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function commitExpression(source = "manual") {
  const evaluation = getEvaluationResult();
  if (!evaluation.ok) {
    displayResult.textContent = evaluation.message && evaluation.message.includes("overflow") ? "Overflow" : "Error";
    displayMeta.textContent = evaluation.message || "";
    setVoiceStatus(source === "voice" ? `Couldn't evaluate (${evaluation.message})` : "Invalid expression");
    return evaluation;
  }

  lastAnswer = evaluation.value;
  addHistoryEntry(expression, evaluation.value);
  displayResult.textContent = window.OrbitMath.formatNumber(evaluation.value);
  displayMeta.textContent = expression ? `${formatExpression(expression)} =` : "";
  if (source === "voice") {
    setVoiceStatus("Voice result ready.");
  }
  expression = window.OrbitMath.formatNumber(evaluation.value);
  updateDisplay();
  return evaluation;
}

function useMemory(action) {
  const evaluation = getEvaluationResult();
  const currentValue = evaluation.ok ? evaluation.value : lastAnswer;
  if (action === "mc") {
    memoryValue = 0;
  } else if (action === "mr") {
    appendToken(window.OrbitMath.formatNumber(memoryValue));
    return;
  } else if (action === "mplus") {
    memoryValue += currentValue;
  } else if (action === "mminus") {
    memoryValue -= currentValue;
  } else if (action === "ans") {
    appendToken("ans");
    return;
  }
  updateDisplay();
}

function setListening(listening) {
  isListening = listening;
  voiceToggle.setAttribute("aria-pressed", String(listening));
  voiceToggle.textContent = listening ? "Listening..." : "Voice Input";
}

function initializeVoice() {
  if (!SpeechRecognitionApi) {
    voiceToggle.disabled = true;
    setVoiceStatus("Voice input is not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognitionApi();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.addEventListener("start", () => {
    setListening(true);
    setVoiceStatus("Listening for a calculation...");
    setVoiceDebug();
  });

  recognition.addEventListener("result", event => {
    const heard = Array.from(event.results).map(result => result[0].transcript).join(" ").trim();
    const parsed = window.OrbitMath.parseSpokenMath(heard);
    setVoiceDebug(heard, parsed);

    if (!parsed) {
      setVoiceStatus(`Couldn't parse: ${heard}`);
      displayResult.textContent = "Error";
      displayMeta.textContent = "Voice parsing failed.";
      return;
    }

    if (parsed === "clear") {
      clearAll();
      return;
    }

    if (parsed === "=") {
      commitExpression("voice");
      return;
    }

    expression = parsed;
    updateDisplay();
    const evaluation = commitExpression("voice");
    if (!evaluation.ok) {
      setVoiceStatus(`Couldn't evaluate (${evaluation.message})`);
    }
  });

  recognition.addEventListener("error", event => {
    setVoiceStatus(`Voice input error: ${event.error}`);
    setListening(false);
  });

  recognition.addEventListener("end", () => {
    setListening(false);
  });
}

keyboard.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.insert) {
    appendToken(button.dataset.insert);
    return;
  }

  if (button.dataset.wrap) {
    if (button.dataset.wrap === "pow") {
      appendToken("**");
      return;
    }
    wrapExpression(button.dataset.wrap);
    return;
  }

  if (button.dataset.action === "clear") {
    clearAll();
    return;
  }
  if (button.dataset.action === "delete") {
    backspace();
    return;
  }
  if (button.dataset.action === "negate") {
    expression = expression ? `(-1*(${expression}))` : "-";
    updateDisplay();
    return;
  }
  if (button.dataset.action === "equals") {
    commitExpression();
  }
});

memoryRow.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (button) {
    useMemory(button.dataset.memory);
  }
});

angleToggle.addEventListener("click", () => {
  isDegreeMode = !isDegreeMode;
  updateDisplay();
});

clearHistoryButton.addEventListener("click", () => {
  historyEntries = [];
  saveHistory();
  renderHistory();
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
  isEditing = !isEditing;
  updateDisplay();
  if (isEditing) {
    expressionInput.focus();
    expressionInput.setSelectionRange(expressionInput.value.length, expressionInput.value.length);
  } else {
    expressionInput.blur();
  }
});

displayDelete.addEventListener("click", () => {
  if (isEditing) {
    const start = expressionInput.selectionStart ?? expression.length;
    const end = expressionInput.selectionEnd ?? expression.length;
    if (start !== end) {
      expression = `${expression.slice(0, start)}${expression.slice(end)}`;
    } else if (start > 0) {
      expression = `${expression.slice(0, start - 1)}${expression.slice(start)}`;
    }
    updateDisplay();
    expressionInput.focus();
    const cursor = Math.max(0, start - (start === end ? 1 : 0));
    expressionInput.setSelectionRange(cursor, cursor);
    return;
  }
  backspace();
});

displayClear.addEventListener("click", clearAll);

expressionInput.addEventListener("input", event => {
  if (!isEditing) {
    return;
  }
  expression = event.target.value;
  updateDisplay();
});

expressionInput.addEventListener("keydown", event => {
  if (!isEditing) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    commitExpression();
    isEditing = false;
    updateDisplay();
  }
});

window.addEventListener("keydown", event => {
  if (isEditing || event.target === expressionInput) {
    return;
  }
  const allowed = "0123456789+-*/().";
  if (allowed.includes(event.key)) {
    appendToken(event.key);
    return;
  }
  if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    commitExpression();
    return;
  }
  if (event.key === "Backspace") {
    backspace();
    return;
  }
  if (event.key === "Delete") {
    clearAll();
  }
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
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

initializeVoice();
renderHistory();
updateDisplay();
