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

let expression = "0";
let lastAnswer = 0;
let memoryValue = 0;
let isDegreeMode = false;
let deferredInstallPrompt = null;
const storageKey = "orbitScientificHistory";
const historyLimit = 10;
let calculationHistory = loadHistory();

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

function updateDisplay(previewValue = null) {
  expressionInput.value = formatPreview(expression);
  resultOutput.textContent = previewValue ?? formatNumber(lastAnswer);
  memoryIndicator.textContent = `Memory: ${formatNumber(memoryValue)}`;
  modeIndicator.textContent = isDegreeMode ? "Degrees" : "Radians";
  angleToggle.textContent = isDegreeMode ? "DEG" : "RAD";
  angleToggle.setAttribute("aria-pressed", String(isDegreeMode));
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

renderHistory();
updateDisplay("0");
