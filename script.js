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

const previewReplacements = [
  [/Math\.PI/g, "π"],
  [/Math\.E/g, "e"],
  [/Math\.sqrt\(/g, "sqrt("],
  [/Math\.sin\(/g, "sin("],
  [/Math\.cos\(/g, "cos("],
  [/Math\.tan\(/g, "tan("],
  [/Math\.asin\(/g, "asin("],
  [/Math\.acos\(/g, "acos("],
  [/Math\.atan\(/g, "atan("],
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

const spokenTokenMap = [
  [/multiplied by|multiply by|times/g, "*"],
  [/divided by|divide by|over/g, "/"],
  [/plus/g, "+"],
  [/minus/g, "-"],
  [/point|dot|decimal/g, "."],
  [/open bracket|open parenthesis/g, "("],
  [/close bracket|close parenthesis/g, ")"],
  [/pi/g, "Math.PI"],
  [/\bans\b|\banswer\b/g, "ans"],
  [/\be\b/g, "Math.E"]
];

const spokenFunctionMap = [
  [/square root of/g, "Math.sqrt"],
  [/sine inverse of|arc sine of/g, 'safeTrig("asin",'],
  [/cosine inverse of|arc cosine of/g, 'safeTrig("acos",'],
  [/tangent inverse of|arc tangent of/g, 'safeTrig("atan",'],
  [/sine of/g, 'safeTrig("sin",'],
  [/cosine of/g, 'safeTrig("cos",'],
  [/tangent of/g, 'safeTrig("tan",'],
  [/natural log of/g, "Math.log"],
  [/log of|logarithm of/g, "Math.log10"],
  [/absolute value of/g, "Math.abs"],
  [/factorial of/g, "factorial"],
  [/percent of/g, "percent"],
  [/exponential of/g, "Math.exp"]
];

const spokenNumbers = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10"
};

const spokenNumberWords = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000
};

function updateDisplay(previewValue = null) {
  expressionInput.value = formatPreview(expression);
  resultOutput.textContent = previewValue ?? formatNumber(lastAnswer);
  memoryIndicator.textContent = `Memory: ${formatNumber(memoryValue)}`;
  modeIndicator.textContent = isDegreeMode ? "Degrees" : "Radians";
  angleToggle.textContent = isDegreeMode ? "DEG" : "RAD";
  angleToggle.setAttribute("aria-pressed", String(isDegreeMode));
}

function setVoiceStatus(message) {
  voiceStatus.textContent = message;
}

function setListeningState(listening) {
  isListening = listening;
  voiceToggle.setAttribute("aria-pressed", String(listening));
  voiceToggle.textContent = listening ? "Listening..." : "Voice Input";
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
  updateDisplay(previewResult.ok ? formatNumber(previewResult.value) : "...");
}

function setExpression(nextExpression) {
  expression = nextExpression || "0";
  updateLivePreview();
}

function appendVoiceExpression(transcriptExpression) {
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

  setExpression(normalized);
  if (!/[a-z]/i.test(normalized)) {
    commitResult();
  }
}

function normalizeSpokenNumberPhrases(input) {
  const tokens = input.split(/\s+/).filter(Boolean);
  const normalized = [];
  let current = 0;
  let total = 0;
  let inNumberPhrase = false;

  const flush = () => {
    if (inNumberPhrase) {
      normalized.push(String(total + current));
      current = 0;
      total = 0;
      inNumberPhrase = false;
    }
  };

  tokens.forEach(token => {
    if (token === "and" && inNumberPhrase) {
      return;
    }

    if (!(token in spokenNumberWords)) {
      flush();
      normalized.push(token);
      return;
    }

    inNumberPhrase = true;
    const value = spokenNumberWords[token];
    if (value === 100) {
      current = (current || 1) * value;
      return;
    }

    if (value === 1000) {
      total += (current || 1) * value;
      current = 0;
      return;
    }

    current += value;
  });

  flush();
  return normalized.join(" ");
}

function factorial(value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Factorial is defined for non-negative integers only.");
  }
  let output = 1;
  for (let index = 2; index <= value; index += 1) {
    output *= index;
  }
  return output;
}

function percent(value) {
  return value / 100;
}

function toRadians(value) {
  return isDegreeMode ? (value * Math.PI) / 180 : value;
}

function fromRadians(value) {
  return isDegreeMode ? (value * 180) / Math.PI : value;
}

function safeTrig(name, value) {
  switch (name) {
    case "sin":
      return Math.sin(toRadians(value));
    case "cos":
      return Math.cos(toRadians(value));
    case "tan":
      return Math.tan(toRadians(value));
    case "asin":
      return fromRadians(Math.asin(value));
    case "acos":
      return fromRadians(Math.acos(value));
    case "atan":
      return fromRadians(Math.atan(value));
    default:
      throw new Error("Unknown trig function.");
  }
}

function tryEvaluate(rawExpression) {
  try {
    const sanitized = rawExpression
      .replace(/ans/g, `(${lastAnswer})`)
      .replace(/Math\.PI/g, `(${Math.PI})`)
      .replace(/Math\.E/g, `(${Math.E})`);

    const evaluator = new Function(
      "factorial",
      "percent",
      "safeTrig",
      `"use strict"; return (${sanitized});`
    );
    const value = evaluator(factorial, percent, safeTrig);
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("Invalid result.");
    }
    return { ok: true, value };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function parseSpokenMath(transcript) {
  let parsed = transcript.toLowerCase().trim();

  if (!parsed) {
    return "";
  }

  parsed = parsed.replace(/[?,]/g, " ");
  parsed = parsed.replace(/％/g, "%");
  parsed = parsed.replace(/\bwhat is\b|\bwhat's\b|\bhow much is\b|\bhow much\b|\bplease\b|\bcan you\b|\bcould you\b|\bfind\b|\btell me\b|\bsolve\b|\bgive me\b/g, " ");
  parsed = parsed.replace(/\bthe result of\b|\bresult of\b|\bvalue of\b/g, " ");
  parsed = parsed.replace(/\bis\b/g, " ");
  parsed = parsed.replace(/\bdegrees\b|\bdegree\b/g, "");
  parsed = parsed.replace(/\binto\b/g, "*");
  parsed = parsed.replace(/\s+/g, " ").trim();
  parsed = normalizeSpokenNumberPhrases(parsed);

  const directPercentOf = parsed.match(/^(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)$/);
  if (directPercentOf) {
    return `((${directPercentOf[1]}/100)*${directPercentOf[2]})`;
  }

  const directWordPercentOf = parsed.match(/^(\d+(?:\.\d+)?)\s+percent\s+of\s+(\d+(?:\.\d+)?)$/);
  if (directWordPercentOf) {
    return `((${directWordPercentOf[1]}/100)*${directWordPercentOf[2]})`;
  }

  parsed = parsed.replace(/(\d+(?:\.\d+)?)\s*%+\s*of\s*(\d+(?:\.\d+)?)/g, "(($1/100)*$2)");
  parsed = parsed.replace(/(\d+(?:\.\d+)?)\s+percent\s+of\s+(\d+(?:\.\d+)?)/g, "(($1/100)*$2)");
  parsed = parsed.replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)");
  parsed = parsed.replace(/(\d+(?:\.\d+)?)\s+percent\b/g, "($1/100)");

  if (/(equals|equal to|calculate|compute)$/.test(parsed)) {
    parsed = parsed.replace(/(equals|equal to|calculate|compute)$/g, "").trim();
    if (!parsed) {
      return "=";
    }
  }

  if (/^(clear|all clear|reset)$/.test(parsed)) {
    return "clear";
  }

  Object.entries(spokenNumbers).forEach(([word, digit]) => {
    parsed = parsed.replace(new RegExp(`\\b${word}\\b`, "g"), digit);
  });

  spokenFunctionMap.forEach(([pattern, replacement]) => {
    parsed = parsed.replace(pattern, `${replacement} `);
  });

  spokenTokenMap.forEach(([pattern, replacement]) => {
    parsed = parsed.replace(pattern, ` ${replacement} `);
  });

  parsed = parsed.replace(/to the power of|power of/g, "**");
  parsed = parsed.replace(/squared/g, "**2");
  parsed = parsed.replace(/cubed/g, "**3");
  parsed = parsed.replace(/multiplied with/g, "*");
  parsed = parsed.replace(/added to/g, "+");
  parsed = parsed.replace(/subtracted from/g, "-");
  parsed = parsed.replace(/\bof\b/g, "*");
  parsed = parsed.replace(/\bby\b/g, " ");
  parsed = parsed.replace(/\s+percentage\b/g, " percent");
  parsed = parsed.replace(/\s+/g, " ").trim();

  const tokens = parsed.split(" ").filter(Boolean);
  const output = [];
  const stack = [];

  tokens.forEach(token => {
    if (
      token === "Math.sqrt" ||
      token === "Math.log" ||
      token === "Math.log10" ||
      token === "Math.abs" ||
      token === "factorial" ||
      token === "percent" ||
      token === "Math.exp"
    ) {
      output.push(`${token}(`);
      stack.push(")");
      return;
    }

    if (token.startsWith('safeTrig("')) {
      output.push(`${token} `);
      stack.push(")");
      return;
    }

    if (/^[a-z]+$/i.test(token) && token !== "ans") {
      return;
    }

    output.push(token);
  });

  return `${output.join(" ")}${stack.reverse().join("")}`.trim();
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
  });

  recognition.addEventListener("result", event => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(" ");

    const parsedExpression = parseSpokenMath(transcript);
    if (!parsedExpression) {
      setVoiceStatus(`Couldn't parse: "${transcript}"`);
      return;
    }

    appendVoiceExpression(parsedExpression);
    setVoiceStatus(`Heard: ${transcript}`);
  });

  recognition.addEventListener("error", event => {
    setVoiceStatus(`Voice input error: ${event.error}`);
  });

  recognition.addEventListener("end", () => {
    setListeningState(false);
  });
}

function commitResult() {
  const evaluated = tryEvaluate(expression);
  if (!evaluated.ok) {
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

function clearExpression() {
  expression = "0";
  historyOutput.textContent = "Ready";
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

  updateDisplay(tryEvaluate(expression).ok ? formatNumber(tryEvaluate(expression).value) : "...");
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
    navigator.serviceWorker.register("./sw.js").catch(() => {
      historyOutput.textContent = historyOutput.textContent || "Service worker registration failed.";
    });
  });
}

initializeVoiceRecognition();
renderHistory();
updateDisplay("0");
