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

const spokenTokenMap = [
  [/\bmultiplied by\b|\bmultiply by\b|\btimes\b/g, "*"],
  [/\bdivided by\b|\bdivide by\b|\bover\b/g, "/"],
  [/\bplus\b/g, "+"],
  [/\bminus\b/g, "-"],
  [/\bpoint\b|\bdot\b|\bdecimal\b/g, "."],
  [/\bopen bracket\b|\bopen parenthesis\b/g, "("],
  [/\bclose bracket\b|\bclose parenthesis\b/g, ")"],
  [/\bpi\b/g, "Math.PI"],
  [/\bans\b|\banswer\b/g, "ans"],
  [/\be\b/g, "Math.E"]
];

const spokenFunctionMap = [
  [/\bsquare root of\b|\broot of\b/g, "Math.sqrt"],
  [/\bcube root of\b/g, "cbrt"],
  [/\bsine inverse of\b|\binverse sine of\b|\barc sine of\b|\bsin inverse of\b|\bsin\^-1 of\b/g, 'safeTrig("asin",'],
  [/\bcosine inverse of\b|\binverse cosine of\b|\barc cosine of\b|\bcos inverse of\b|\bcos\^-1 of\b/g, 'safeTrig("acos",'],
  [/\btangent inverse of\b|\binverse tangent of\b|\barc tangent of\b|\btan inverse of\b|\btan\^-1 of\b/g, 'safeTrig("atan",'],
  [/\bcotangent inverse of\b|\binverse cotangent of\b|\barc cotangent of\b|\bcot inverse of\b|\bcot\^-1 of\b/g, 'safeTrig("acot",'],
  [/\bsecant inverse of\b|\binverse secant of\b|\barc secant of\b|\bsec inverse of\b|\bsec\^-1 of\b/g, 'safeTrig("asec",'],
  [/\bcosecant inverse of\b|\binverse cosecant of\b|\barc cosecant of\b|\bcosec inverse of\b|\bcosec\^-1 of\b|\bcsc inverse of\b|\bcsc\^-1 of\b/g, 'safeTrig("acsc",'],
  [/\bsine of\b|\bsin of\b/g, 'safeTrig("sin",'],
  [/\bcosine of\b|\bcos of\b/g, 'safeTrig("cos",'],
  [/\btangent of\b|\btan of\b/g, 'safeTrig("tan",'],
  [/\bcotangent of\b|\bcot of\b/g, 'safeTrig("cot",'],
  [/\bsecant of\b|\bsec of\b/g, 'safeTrig("sec",'],
  [/\bcosecant of\b|\bcosec of\b|\bcsc of\b/g, 'safeTrig("csc",'],
  [/\bnatural log of\b|\bnatural logarithm of\b|\bln of\b/g, "Math.log"],
  [/\blog base 10 of\b|\bcommon log of\b|\bcommon logarithm of\b|\blogarithm of\b|\blog of\b/g, "Math.log10"],
  [/\babsolute value of\b|\bmodulus of\b|\bmod of\b/g, "Math.abs"],
  [/\bfactorial of\b/g, "factorial"],
  [/\bpercent of\b/g, "percent"],
  [/\bexponential of\b|\be to the power of\b/g, "Math.exp"]
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

const bareVoiceFunctions = {
  sin: 'safeTrig("sin",',
  sine: 'safeTrig("sin",',
  cos: 'safeTrig("cos",',
  cosine: 'safeTrig("cos",',
  tan: 'safeTrig("tan",',
  tangent: 'safeTrig("tan",',
  cot: 'safeTrig("cot",',
  cotangent: 'safeTrig("cot",',
  sec: 'safeTrig("sec",',
  secant: 'safeTrig("sec",',
  csc: 'safeTrig("csc",',
  cosec: 'safeTrig("csc",',
  cosecant: 'safeTrig("csc",',
  asin: 'safeTrig("asin",',
  acos: 'safeTrig("acos",',
  atan: 'safeTrig("atan",',
  acot: 'safeTrig("acot",',
  asec: 'safeTrig("asec",',
  acsc: 'safeTrig("acsc",',
  ln: "Math.log(",
  log: "Math.log10(",
  logarithm: "Math.log10(",
  sqrt: "Math.sqrt(",
  root: "Math.sqrt(",
  cbrt: "cbrt(",
  abs: "Math.abs(",
  modulus: "Math.abs(",
  mod: "Math.abs(",
  factorial: "factorial(",
  percent: "percent(",
  exp: "Math.exp("
};

const canonicalVoiceFunctions = {
  "__FN_SIN__": 'safeTrig("sin",',
  "__FN_COS__": 'safeTrig("cos",',
  "__FN_TAN__": 'safeTrig("tan",',
  "__FN_COT__": 'safeTrig("cot",',
  "__FN_SEC__": 'safeTrig("sec",',
  "__FN_CSC__": 'safeTrig("csc",',
  "__FN_ASIN__": 'safeTrig("asin",',
  "__FN_ACOS__": 'safeTrig("acos",',
  "__FN_ATAN__": 'safeTrig("atan",',
  "__FN_ACOT__": 'safeTrig("acot",',
  "__FN_ASEC__": 'safeTrig("asec",',
  "__FN_ACSC__": 'safeTrig("acsc",',
  "__FN_LOG__": "Math.log10(",
  "__FN_LN__": "Math.log(",
  "__FN_SQRT__": "Math.sqrt(",
  "__FN_CBRT__": "cbrt(",
  "__FN_ABS__": "Math.abs(",
  "__FN_EXP__": "Math.exp(",
  "__FN_FACTORIAL__": "factorial(",
  "__FN_PERCENT__": "percent("
};

const canonicalVoicePhrases = [
  ["raised to the power of", "**"],
  ["raised to the power", "**"],
  ["to the power of", "**"],
  ["to the power", "**"],
  ["power of", "**"],
  ["multiplied by", "*"],
  ["multiply by", "*"],
  ["multiplied with", "*"],
  ["divided by", "/"],
  ["divide by", "/"],
  ["open bracket", "("],
  ["open parenthesis", "("],
  ["close bracket", ")"],
  ["close parenthesis", ")"],
  ["plus sign", "+"],
  ["minus sign", "-"],
  ["added to", "+"],
  ["subtracted from", "-"],
  ["natural logarithm of", "__FN_LN__"],
  ["natural log of", "__FN_LN__"],
  ["common logarithm of", "__FN_LOG__"],
  ["common log of", "__FN_LOG__"],
  ["logarithm of", "__FN_LOG__"],
  ["log base 10 of", "__FN_LOG__"],
  ["square root of", "__FN_SQRT__"],
  ["cube root of", "__FN_CBRT__"],
  ["absolute value of", "__FN_ABS__"],
  ["modulus of", "__FN_ABS__"],
  ["mod of", "__FN_ABS__"],
  ["exponential of", "__FN_EXP__"],
  ["e to the power of", "__FN_EXP__"],
  ["sine inverse of", "__FN_ASIN__"],
  ["inverse sine of", "__FN_ASIN__"],
  ["arc sine of", "__FN_ASIN__"],
  ["sin inverse of", "__FN_ASIN__"],
  ["sin^-1 of", "__FN_ASIN__"],
  ["cosine inverse of", "__FN_ACOS__"],
  ["inverse cosine of", "__FN_ACOS__"],
  ["arc cosine of", "__FN_ACOS__"],
  ["cos inverse of", "__FN_ACOS__"],
  ["cos^-1 of", "__FN_ACOS__"],
  ["tangent inverse of", "__FN_ATAN__"],
  ["inverse tangent of", "__FN_ATAN__"],
  ["arc tangent of", "__FN_ATAN__"],
  ["tan inverse of", "__FN_ATAN__"],
  ["tan^-1 of", "__FN_ATAN__"],
  ["cotangent inverse of", "__FN_ACOT__"],
  ["inverse cotangent of", "__FN_ACOT__"],
  ["arc cotangent of", "__FN_ACOT__"],
  ["cot inverse of", "__FN_ACOT__"],
  ["cot^-1 of", "__FN_ACOT__"],
  ["secant inverse of", "__FN_ASEC__"],
  ["inverse secant of", "__FN_ASEC__"],
  ["arc secant of", "__FN_ASEC__"],
  ["sec inverse of", "__FN_ASEC__"],
  ["sec^-1 of", "__FN_ASEC__"],
  ["cosecant inverse of", "__FN_ACSC__"],
  ["inverse cosecant of", "__FN_ACSC__"],
  ["arc cosecant of", "__FN_ACSC__"],
  ["cosec inverse of", "__FN_ACSC__"],
  ["cosec^-1 of", "__FN_ACSC__"],
  ["csc inverse of", "__FN_ACSC__"],
  ["csc^-1 of", "__FN_ACSC__"],
  ["sine of", "__FN_SIN__"],
  ["cosine of", "__FN_COS__"],
  ["tangent of", "__FN_TAN__"],
  ["cotangent of", "__FN_COT__"],
  ["secant of", "__FN_SEC__"],
  ["cosecant of", "__FN_CSC__"],
  ["cosec of", "__FN_CSC__"],
  ["csc of", "__FN_CSC__"],
  ["factorial of", "__FN_FACTORIAL__"],
  ["percent of", "__FN_PERCENT__"],
  ["times", "*"],
  ["over", "/"],
  ["plus", "+"],
  ["minus", "-"],
  ["point", "."],
  ["dot", "."],
  ["decimal", "."]
];

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
    updateDisplay(tryEvaluate(expression).ok ? formatNumber(tryEvaluate(expression).value) : "...");
    requestAnimationFrame(() => {
      expressionInput.focus();
      const cursor = expressionInput.value.length;
      expressionInput.setSelectionRange(cursor, cursor);
    });
    return;
  }
  expressionInput.blur();
  updateDisplay(tryEvaluate(expression).ok ? formatNumber(tryEvaluate(expression).value) : "...");
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

function normalizeSpeechAliases(input) {
  return input
    .replace(/\bco sign\b|\bcos sign\b|\bco sine\b/g, "cosine")
    .replace(/\bsyne\b/g, "sine")
    .replace(/\btanjent\b/g, "tangent")
    .replace(/\bco tangent\b/g, "cotangent")
    .replace(/\bsea cant\b|\bsee cant\b/g, "secant")
    .replace(/\bco sec\b|\bco-secant\b|\bco secant\b/g, "cosecant")
    .replace(/\barc tan\b/g, "arc tangent")
    .replace(/\barc cos\b/g, "arc cosine")
    .replace(/\barc sin\b/g, "arc sine")
    .replace(/\bpie\b/g, "pi")
    .replace(/\bellen\b/g, "ln");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyCanonicalVoicePhrases(input) {
  let normalized = input;

  canonicalVoicePhrases
    .slice()
    .sort((left, right) => right[0].length - left[0].length)
    .forEach(([phrase, replacement]) => {
      const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "g");
      normalized = normalized.replace(pattern, replacement);
    });

  return normalized;
}

function compactParsedExpression(input) {
  let compact = input;
  compact = compact.replace(/\(\s+/g, "(");
  compact = compact.replace(/\s+\)/g, ")");
  compact = compact.replace(/\s*,\s*/g, ", ");
  compact = compact.replace(/(\d)\s*\.\s*(\d)/g, "$1.$2");
  compact = compact.replace(/(^|[^\d])\.\s*(\d)/g, "$10.$2");
  compact = compact.replace(/(\d)\.(?=\D|$)/g, "$1");
  compact = compact.replace(/\+\s+(\d)/g, "+$1");
  compact = compact.replace(/-\s+(\d)/g, "-$1");
  compact = compact.replace(/\*\s+(\d)/g, "*$1");
  compact = compact.replace(/\/\s+(\d)/g, "/$1");
  compact = compact.replace(/\)\s*\./g, ")");
  compact = compact.replace(/\s+/g, " ").trim();
  compact = compact.replace(/[;:!?]+$/g, "");
  compact = compact.replace(/\s+/g, " ").trim();
  return compact;
}

function normalizeMathArtifacts(input) {
  let normalized = compactParsedExpression(input);
  normalized = normalized.replace(/(\d)\.(?=[\)\+\-\*\/]|$)/g, "$1");
  normalized = normalized.replace(/Math\.log10\(([^()]+)\.\)/g, "Math.log10($1)");
  normalized = normalized.replace(/Math\.log\(([^()]+)\.\)/g, "Math.log($1)");
  normalized = normalized.replace(/Math\.sqrt\(([^()]+)\.\)/g, "Math.sqrt($1)");
  normalized = normalized.replace(/Math\.abs\(([^()]+)\.\)/g, "Math.abs($1)");
  normalized = normalized.replace(/Math\.exp\(([^()]+)\.\)/g, "Math.exp($1)");
  normalized = normalized.replace(/safeTrig\("([a-z]+)",\s*([^()]+)\.\)/g, 'safeTrig("$1", $2)');
  normalized = normalized.replace(/factorial\(([^()]+)\.\)/g, "factorial($1)");
  normalized = normalized.replace(/percent\(([^()]+)\.\)/g, "percent($1)");
  normalized = normalized.replace(/cbrt\(([^()]+)\.\)/g, "cbrt($1)");
  return normalized;
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
    case "cot":
      return 1 / Math.tan(toRadians(value));
    case "sec":
      return 1 / Math.cos(toRadians(value));
    case "csc":
      return 1 / Math.sin(toRadians(value));
    case "asin":
      return fromRadians(Math.asin(value));
    case "acos":
      return fromRadians(Math.acos(value));
    case "atan":
      return fromRadians(Math.atan(value));
    case "acot":
      return fromRadians(Math.atan(1 / value));
    case "asec":
      return fromRadians(Math.acos(1 / value));
    case "acsc":
      return fromRadians(Math.asin(1 / value));
    default:
      throw new Error("Unknown trig function.");
  }
}

function tryEvaluate(rawExpression) {
  try {
    const sanitized = normalizeMathArtifacts(rawExpression)
      .replace(/ans/g, `(${lastAnswer})`)
      .replace(/Math\.PI/g, `(${Math.PI})`)
      .replace(/Math\.E/g, `(${Math.E})`);

    const evaluator = new Function(
      "factorial",
      "percent",
      "safeTrig",
      "cbrt",
      `"use strict"; return (${sanitized});`
    );
    const value = evaluator(factorial, percent, safeTrig, Math.cbrt);
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
  parsed = normalizeSpeechAliases(parsed);
  parsed = parsed.replace(/\bwhat is\b|\bwhat's\b|\bhow much is\b|\bhow much\b|\bplease\b|\bcan you\b|\bcould you\b|\bfind\b|\btell me\b|\bsolve\b|\bgive me\b/g, " ");
  parsed = parsed.replace(/\bthe result of\b|\bresult of\b|\bvalue of\b/g, " ");
  parsed = parsed.replace(/\bis\b/g, " ");
  parsed = parsed.replace(/\bdegrees\b|\bdegree\b/g, "");
  parsed = parsed.replace(/\bradians\b|\bradian\b/g, "");
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
  parsed = applyCanonicalVoicePhrases(parsed);
  parsed = parsed.replace(/\bsquared\b/g, "**2");
  parsed = parsed.replace(/\bcubed\b/g, "**3");
  parsed = parsed.replace(/\braised to\b/g, "**");
  parsed = parsed.replace(/\s+percentage\b/g, " percent");
  parsed = compactParsedExpression(parsed);

  const tokens = parsed.split(" ").filter(Boolean);
  const output = [];
  const stack = [];
  const unknownWords = [];

  const bareFunctionTokens = { ...bareVoiceFunctions };

  const operatorTokens = {
    "__OP_ADD__": "+",
    "__OP_SUB__": "-",
    "__OP_MUL__": "*",
    "__OP_DIV__": "/",
    "__OP_POW__": "**"
  };

  tokens.forEach(token => {
    if (canonicalVoiceFunctions[token]) {
      output.push(canonicalVoiceFunctions[token]);
      stack.push(")");
      return;
    }

    if (operatorTokens[token]) {
      output.push(operatorTokens[token]);
      return;
    }

    if (bareFunctionTokens[token]) {
      output.push(bareFunctionTokens[token]);
      stack.push(")");
      return;
    }

    if (["(", ")", "+", "-", "*", "/", "**"].includes(token)) {
      output.push(token);
      return;
    }

    if (/^[a-z]+$/i.test(token) && token !== "ans") {
      unknownWords.push(token);
      return;
    }

    output.push(token);
  });

  if (unknownWords.length > 0) {
    return "";
  }

  return normalizeMathArtifacts(`${output.join(" ")}${stack.reverse().join("")}`.trim());
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
