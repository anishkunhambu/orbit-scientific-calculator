var window = this;  
var globalThis = this;  
(function (global) {
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
    ["raised to the power of", "__OP_POW__"],
    ["raised to the power", "__OP_POW__"],
    ["raise to the power of", "__OP_POW__"],
    ["raise to the power", "__OP_POW__"],
    ["to the power of", "__OP_POW__"],
    ["to the power", "__OP_POW__"],
    ["raise to", "__OP_POW__"],
    ["power of", "__OP_POW__"],
    ["multiplied by", "__OP_MUL__"],
    ["multiply by", "__OP_MUL__"],
    ["multiplied with", "__OP_MUL__"],
    ["divided by", "__OP_DIV__"],
    ["divide by", "__OP_DIV__"],
    ["open bracket", "("],
    ["open parenthesis", "("],
    ["close bracket", ")"],
    ["close parenthesis", ")"],
    ["plus sign", "__OP_ADD__"],
    ["minus sign", "__OP_SUB__"],
    ["added to", "__OP_ADD__"],
    ["subtracted from", "__OP_SUB__"],
    ["natural logarithm of", "__FN_LN__"],
    ["natural log of", "__FN_LN__"],
    ["ln of", "__FN_LN__"],
    ["common logarithm of", "__FN_LOG__"],
    ["common log of", "__FN_LOG__"],
    ["logarithm of", "__FN_LOG__"],
    ["log base 10 of", "__FN_LOG__"],
    ["log of", "__FN_LOG__"],
    ["square root of", "__FN_SQRT__"],
    ["root of", "__FN_SQRT__"],
    ["cube root of", "__FN_CBRT__"],
    ["square of", "__OP_SQUARE_OF__"],
    ["cube of", "__OP_CUBE_OF__"],
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
    ["times", "__OP_MUL__"],
    ["over", "__OP_DIV__"],
    ["plus", "__OP_ADD__"],
    ["minus", "__OP_SUB__"],
    ["point", "."],
    ["dot", "."],
    ["decimal", "."]
  ];

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

  function toRadians(value, isDegreeMode) {
    return isDegreeMode ? (value * Math.PI) / 180 : value;
  }

  function fromRadians(value, isDegreeMode) {
    return isDegreeMode ? (value * 180) / Math.PI : value;
  }

  function safeTrig(name, value, isDegreeMode) {
    switch (name) {
      case "sin": return Math.sin(toRadians(value, isDegreeMode));
      case "cos": return Math.cos(toRadians(value, isDegreeMode));
      case "tan": return Math.tan(toRadians(value, isDegreeMode));
      case "cot": return 1 / Math.tan(toRadians(value, isDegreeMode));
      case "sec": return 1 / Math.cos(toRadians(value, isDegreeMode));
      case "csc": return 1 / Math.sin(toRadians(value, isDegreeMode));
      case "asin": return fromRadians(Math.asin(value), isDegreeMode);
      case "acos": return fromRadians(Math.acos(value), isDegreeMode);
      case "atan": return fromRadians(Math.atan(value), isDegreeMode);
      case "acot": return fromRadians(Math.atan(1 / value), isDegreeMode);
      case "asec": return fromRadians(Math.acos(1 / value), isDegreeMode);
      case "acsc": return fromRadians(Math.asin(1 / value), isDegreeMode);
      default: throw new Error("Unknown trig function.");
    }
  }

  function normalizeSpokenNumberPhrases(input) {
    const tokens = input.split(/\s+/).filter(Boolean);
    const normalized = [];
    let current = 0;
    let total = 0;
    let inNumberPhrase = false;

    function flush() {
      if (inNumberPhrase) {
        normalized.push(String(total + current));
        current = 0;
        total = 0;
        inNumberPhrase = false;
      }
    }

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
    compact = compact.replace(/[;:!?]+$/g, "");
    compact = compact.replace(/\s+/g, " ").trim();
    return compact;
  }

  function isSimpleVoiceArgument(token) {
    return /^-?(?:\d+(?:\.\d+)?|ans|Math\.PI|Math\.E)$/i.test(token);
  }

  function balanceParentheses(input) {
    let balance = 0;
    for (const char of input) {
      if (char === "(") {
        balance += 1;
      } else if (char === ")") {
        balance -= 1;
      }
    }

    if (balance > 0) {
      return `${input}${")".repeat(balance)}`;
    }

    return input;
  }

  function normalizeMathArtifacts(input) {
    let normalized = balanceParentheses(compactParsedExpression(input));
    normalized = normalized.replace(/\^/g, "**");
    normalized = normalized.replace(/(\d)\.(?=[\)\+\-\*\/]|$)/g, "$1");
    normalized = normalized.replace(/(?:Math\.){2,}/g, "Math.");
    normalized = normalized.replace(/\b(Math\.(?:sqrt|log10|log|abs|exp)|cbrt|factorial|percent)\s+(-?(?:\d+(?:\.\d+)?|ans|Math\.PI|Math\.E|\([^()]+\)))/g, "$1($2)");
    normalized = normalized.replace(/safeTrig\("([a-z]+)",\s*(-?(?:\d+(?:\.\d+)?|ans|Math\.PI|Math\.E|\([^()]+\)))(?!\s*\))/g, 'safeTrig("$1", $2)');
    normalized = normalized.replace(/Math\.log10\(([^()]+)\.\)/g, "Math.log10($1)");
    normalized = normalized.replace(/Math\.log\(([^()]+)\.\)/g, "Math.log($1)");
    normalized = normalized.replace(/Math\.sqrt\(([^()]+)\.\)/g, "Math.sqrt($1)");
    normalized = normalized.replace(/Math\.abs\(([^()]+)\.\)/g, "Math.abs($1)");
    normalized = normalized.replace(/Math\.exp\(([^()]+)\.\)/g, "Math.exp($1)");
    normalized = normalized.replace(/safeTrig\("([a-z]+)",\s*([^()]+)\.\)/g, 'safeTrig("$1", $2)');
    normalized = normalized.replace(/factorial\(([^()]+)\.\)/g, "factorial($1)");
    normalized = normalized.replace(/percent\(([^()]+)\.\)/g, "percent($1)");
    normalized = normalized.replace(/cbrt\(([^()]+)\.\)/g, "cbrt($1)");
    normalized = normalized.replace(/(safeTrig\("[a-z]+",\s*[^()]+\))\)+/g, "$1");
    normalized = normalized.replace(/((?:Math\.(?:sqrt|log10|log|abs|exp)|cbrt|factorial|percent)\([^()]+\))\)+/g, "$1");
    return balanceParentheses(normalized);
  }

  function splitTopLevelBinary(input, operator) {
    let depth = 0;
    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      const nextTwo = input.slice(index, index + 2);

      if (char === "(") {
        depth += 1;
        continue;
      }

      if (char === ")") {
        depth -= 1;
        continue;
      }

      if (depth !== 0) {
        continue;
      }

      if (operator === "**") {
        if (nextTwo === "**") {
          return [
            input.slice(0, index).trim(),
            input.slice(index + 2).trim()
          ];
        }
        continue;
      }

      if (char === operator) {
        return [
          input.slice(0, index).trim(),
          input.slice(index + 1).trim()
        ];
      }
    }

    return null;
  }

  function tryEvaluateDirectFunction(sanitized, options = {}) {
    const { lastAnswer = 0, isDegreeMode = false } = options;

    const trigMatch = sanitized.match(/^safeTrig\("([a-z]+)",\s*(.+)\)$/);
    if (trigMatch) {
      const argResult = tryEvaluate(trigMatch[2], { lastAnswer, isDegreeMode });
      if (!argResult.ok) {
        return argResult;
      }
      try {
        return { ok: true, value: safeTrig(trigMatch[1], argResult.value, isDegreeMode) };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }

    const directMatch = sanitized.match(/^(Math\.(sqrt|log10|log|abs|exp)|cbrt|factorial|percent)\((.+)\)$/);
    if (!directMatch) {
      return null;
    }

    const argResult = tryEvaluate(directMatch[3], { lastAnswer, isDegreeMode });
    if (!argResult.ok) {
      return argResult;
    }

    try {
      switch (directMatch[1]) {
        case "Math.sqrt":
          return { ok: true, value: Math.sqrt(argResult.value) };
        case "Math.log10":
          return { ok: true, value: Math.log10(argResult.value) };
        case "Math.log":
          return { ok: true, value: Math.log(argResult.value) };
        case "Math.abs":
          return { ok: true, value: Math.abs(argResult.value) };
        case "Math.exp":
          return { ok: true, value: Math.exp(argResult.value) };
        case "cbrt":
          return { ok: true, value: Math.cbrt(argResult.value) };
        case "factorial":
          return { ok: true, value: factorial(argResult.value) };
        case "percent":
          return { ok: true, value: percent(argResult.value) };
        default:
          return null;
      }
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  function tryEvaluateDirectBinary(sanitized, options = {}) {
    const operators = ["**", "*", "/", "+", "-"];

    for (const operator of operators) {
      const parts = splitTopLevelBinary(sanitized, operator);
      if (!parts) {
        continue;
      }

      const [leftRaw, rightRaw] = parts;
      if (!leftRaw || !rightRaw) {
        return null;
      }

      const leftResult = tryEvaluate(leftRaw, options);
      if (!leftResult.ok) {
        return leftResult;
      }

      const rightResult = tryEvaluate(rightRaw, options);
      if (!rightResult.ok) {
        return rightResult;
      }

      try {
        switch (operator) {
          case "**":
            return { ok: true, value: leftResult.value ** rightResult.value };
          case "*":
            return { ok: true, value: leftResult.value * rightResult.value };
          case "/":
            return { ok: true, value: leftResult.value / rightResult.value };
          case "+":
            return { ok: true, value: leftResult.value + rightResult.value };
          case "-":
            return { ok: true, value: leftResult.value - rightResult.value };
          default:
            return null;
        }
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }

    return null;
  }

  function parseSpokenMath(transcript) {
    let parsed = (transcript || "").toLowerCase().trim();
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
    parsed = parsed.replace(
      /\b(sin|sine|cos|cosine|tan|tangent|cot|cotangent|sec|secant|csc|cosec|cosecant|asin|acos|atan|acot|asec|acsc|ln|log|logarithm|sqrt|root|cbrt|abs|modulus|mod|factorial|percent|exp)\s+of\b/g,
      "$1"
    );
    parsed = parsed.replace(/\b(__FN_[A-Z]+__)\s+of\b/g, "$1");
    parsed = parsed.replace(/\bsquared\b/g, "**2");
    parsed = parsed.replace(/\bcubed\b/g, "**3");
    parsed = parsed.replace(/\braised to\b/g, "**");
    parsed = parsed.replace(/\s+percentage\b/g, " percent");
    parsed = compactParsedExpression(parsed);

    const tokens = parsed.split(" ").filter(Boolean);
    const output = [];
    const stack = [];
    const unknownWords = [];
    const operatorTokens = {
      "__OP_ADD__": "+",
      "__OP_SUB__": "-",
      "__OP_MUL__": "*",
      "__OP_DIV__": "/",
      "__OP_POW__": "**"
    };

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      const nextToken = tokens[index + 1];

      if (token === "__OP_SQUARE_OF__") {
        output.push("(");
        stack.push(")**2");
        continue;
      }
      if (token === "__OP_CUBE_OF__") {
        output.push("(");
        stack.push(")**3");
        continue;
      }
      if (canonicalVoiceFunctions[token]) {
        if (isSimpleVoiceArgument(nextToken)) {
          output.push(`${canonicalVoiceFunctions[token]}${nextToken})`);
          index += 1;
          continue;
        }
        output.push(canonicalVoiceFunctions[token]);
        stack.push(")");
        continue;
      }
      if (operatorTokens[token]) {
        output.push(operatorTokens[token]);
        continue;
      }
      if (bareVoiceFunctions[token]) {
        if (isSimpleVoiceArgument(nextToken)) {
          output.push(`${bareVoiceFunctions[token]}${nextToken})`);
          index += 1;
          continue;
        }
        output.push(bareVoiceFunctions[token]);
        stack.push(")");
        continue;
      }
      if (["(", ")", "+", "-", "*", "/", "**"].includes(token)) {
        output.push(token);
        continue;
      }
      if (/^[a-z]+$/i.test(token) && token !== "ans") {
        unknownWords.push(token);
        continue;
      }
      output.push(token);
    }

    if (unknownWords.length > 0) {
      return "";
    }

    return normalizeMathArtifacts(`${output.join(" ")}${stack.reverse().join("")}`.trim());
  }

  function tryEvaluate(rawExpression, options = {}) {
    const { lastAnswer = 0, isDegreeMode = false } = options;
    try {
      const sanitized = normalizeMathArtifacts(rawExpression)
        .replace(/ans/g, `(${lastAnswer})`)
        .replace(/Math\.PI/g, `(${Math.PI})`)
        .replace(/Math\.E/g, `(${Math.E})`);

      const directFunctionResult = tryEvaluateDirectFunction(sanitized, { lastAnswer, isDegreeMode });
      if (directFunctionResult) {
        if (!directFunctionResult.ok) {
          return directFunctionResult;
        }
        if (!Number.isFinite(directFunctionResult.value)) {
          throw new Error("Result overflow.");
        }
        return directFunctionResult;
      }

      const directBinaryResult = tryEvaluateDirectBinary(sanitized, { lastAnswer, isDegreeMode });
      if (directBinaryResult) {
        if (!directBinaryResult.ok) {
          return directBinaryResult;
        }
        if (!Number.isFinite(directBinaryResult.value)) {
          throw new Error("Result overflow.");
        }
        return directBinaryResult;
      }

      const evaluator = new Function(
        "factorial",
        "percent",
        "safeTrig",
        "cbrt",
        "isDegreeMode",
        `"use strict"; return (${sanitized});`
      );
      const value = evaluator(
        factorial,
        percent,
        (name, arg) => safeTrig(name, arg, isDegreeMode),
        Math.cbrt,
        isDegreeMode
      );
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error("Invalid result.");
      }
      if (!Number.isFinite(value)) {
        throw new Error("Result overflow.");
      }
      return { ok: true, value };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  const api = {
    parseSpokenMath,
    tryEvaluate,
    normalizeMathArtifacts,
    balanceParentheses,
    compactParsedExpression,
    normalizeSpeechAliases,
    normalizeSpokenNumberPhrases
  };

  global.VoiceMath = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : window));
var expr = VoiceMath.parseSpokenMath('sin 60');  
WScript.Echo('PARSED=' + expr);  
var result = VoiceMath.tryEvaluate(expr, { lastAnswer: 0, isDegreeMode: true });  
WScript.Echo('OK=' + result.ok);  
if (result.message) WScript.Echo('MSG=' + result.message);  
if (typeof result.value !== 'undefined') WScript.Echo('VAL=' + result.value);  
