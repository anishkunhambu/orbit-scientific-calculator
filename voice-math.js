(function (global) {
  const NUMBER_WORDS = {
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

  const FUNCTION_NAMES = new Set([
    "sin", "cos", "tan", "asin", "acos", "atan",
    "log", "ln", "sqrt", "cbrt", "abs", "fact", "percent", "exp"
  ]);

  function factorial(value) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Factorial needs a non-negative integer.");
    }
    let result = 1;
    for (let i = 2; i <= value; i += 1) {
      result *= i;
    }
    return result;
  }

  function toRadians(value, isDegreeMode) {
    return isDegreeMode ? (value * Math.PI) / 180 : value;
  }

  function fromRadians(value, isDegreeMode) {
    return isDegreeMode ? (value * 180) / Math.PI : value;
  }

  function createScope(isDegreeMode) {
    return {
      sin: value => Math.sin(toRadians(value, isDegreeMode)),
      cos: value => Math.cos(toRadians(value, isDegreeMode)),
      tan: value => Math.tan(toRadians(value, isDegreeMode)),
      asin: value => fromRadians(Math.asin(value), isDegreeMode),
      acos: value => fromRadians(Math.acos(value), isDegreeMode),
      atan: value => fromRadians(Math.atan(value), isDegreeMode),
      log: value => Math.log10(value),
      ln: value => Math.log(value),
      sqrt: value => Math.sqrt(value),
      cbrt: value => Math.cbrt(value),
      abs: value => Math.abs(value),
      fact: value => factorial(value),
      percent: value => value / 100,
      exp: value => Math.exp(value),
      rand: () => Math.random()
    };
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return "Overflow";
    }
    if (Number.isInteger(value)) {
      return String(value);
    }
    return String(Number(value.toFixed(12)));
  }

  function normalizeTypedExpression(input) {
    return (input || "")
      .replace(/[×]/g, "*")
      .replace(/[÷]/g, "/")
      .replace(/[π]/g, "pi")
      .replace(/\^/g, "**")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSpeechAliases(input) {
    return input
      .replace(/[?,]/g, " ")
      .replace(/％/g, "%")
      .replace(/\bco sign\b|\bcos sign\b|\bco sine\b/g, "cosine")
      .replace(/\bsyne\b/g, "sine")
      .replace(/\btanjent\b/g, "tangent")
      .replace(/\bpie\b/g, "pi")
      .replace(/\bellen\b/g, "ln")
      .replace(/\bsine\b/g, "sin")
      .replace(/\bcosine\b/g, "cos")
      .replace(/\btangent\b/g, "tan")
      .replace(/\binverse sine\b/g, "asin")
      .replace(/\binverse cosine\b/g, "acos")
      .replace(/\binverse tangent\b/g, "atan")
      .replace(/\bopen bracket\b|\bopen parenthesis\b/g, "(")
      .replace(/\bclose bracket\b|\bclose parenthesis\b/g, ")")
      .replace(/\bmultiplied by\b|\bmultiply by\b|\btimes\b|\binto\b/g, " * ")
      .replace(/\bdivided by\b|\bdivide by\b|\bover\b/g, " / ")
      .replace(/\bplus\b|\badded to\b/g, " + ")
      .replace(/\bminus\b|\bsubtract\b|\bsubtracted by\b/g, " - ")
      .replace(/\bpoint\b|\bdot\b|\bdecimal\b/g, " . ")
      .replace(/\bwhat is\b|\bwhat's\b|\bhow much is\b|\bplease\b|\bcan you\b|\bcould you\b|\bfind\b|\btell me\b|\bsolve\b|\bgive me\b/g, " ")
      .replace(/\bvalue\b|\bresult\b|\banswer\b/g, " ")
      .replace(/\bdegrees\b|\bdegree\b|\bradians\b|\bradian\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSpokenNumberPhrases(input) {
    const tokens = input.split(/\s+/).filter(Boolean);
    const out = [];
    let current = 0;
    let total = 0;
    let active = false;

    function flush() {
      if (active) {
        out.push(String(total + current));
        current = 0;
        total = 0;
        active = false;
      }
    }

    for (const token of tokens) {
      if (token === "and" && active) {
        continue;
      }
      if (!(token in NUMBER_WORDS)) {
        flush();
        out.push(token);
        continue;
      }

      active = true;
      const value = NUMBER_WORDS[token];
      if (value === 100) {
        current = (current || 1) * 100;
      } else if (value === 1000) {
        total += (current || 1) * 1000;
        current = 0;
      } else {
        current += value;
      }
    }

    flush();
    return out.join(" ");
  }

  function applyPhraseReplacements(input) {
    const replacements = [
      ["raised to the power of", " ** "],
      ["raised to the power", " ** "],
      ["raise to the power of", " ** "],
      ["raise to the power", " ** "],
      ["to the power of", " ** "],
      ["to the power", " ** "],
      ["raise to", " ** "],
      ["square root of", " sqrt "],
      ["cube root of", " cbrt "],
      ["natural log of", " ln "],
      ["ln of", " ln "],
      ["log base 10 of", " log "],
      ["logarithm of", " log "],
      ["log of", " log "],
      ["logarithm", " log "],
      ["sine of", " sin "],
      ["cosine of", " cos "],
      ["tangent of", " tan "],
      ["inverse sine of", " asin "],
      ["inverse cosine of", " acos "],
      ["inverse tangent of", " atan "],
      ["arc sine of", " asin "],
      ["arc cosine of", " acos "],
      ["arc tangent of", " atan "],
      ["square of", " squareof "],
      ["cube of", " cubeof "],
      ["absolute value of", " abs "],
      ["factorial of", " fact "]
    ];

    let output = input;
    replacements
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([from, to]) => {
        output = output.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), to);
      });
    return output.replace(/\s+/g, " ").trim();
  }

  function compileVoiceTokens(tokens) {
    const compiled = [];

    function takeOperand(index) {
      const token = tokens[index];
      if (!token) {
        return { value: "", nextIndex: index };
      }

      if (token === "(") {
        let depth = 1;
        const parts = ["("];
        let cursor = index + 1;
        while (cursor < tokens.length && depth > 0) {
          const current = tokens[cursor];
          if (current === "(") {
            depth += 1;
          } else if (current === ")") {
            depth -= 1;
          }
          parts.push(current);
          cursor += 1;
        }
        return { value: parts.join(" "), nextIndex: cursor };
      }

      return { value: token, nextIndex: index + 1 };
    }

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];

      if (token === "squareof" || token === "cubeof") {
        const operand = takeOperand(index + 1);
        const power = token === "squareof" ? "2" : "3";
        compiled.push(`((${operand.value})**${power})`);
        index = operand.nextIndex - 1;
        continue;
      }

      if (FUNCTION_NAMES.has(token)) {
        const operand = takeOperand(index + 1);
        compiled.push(`${token}(${operand.value})`);
        index = operand.nextIndex - 1;
        continue;
      }

      compiled.push(token);
    }

    return compiled.join(" ");
  }

  function parseSpokenMath(transcript) {
    let parsed = normalizeSpeechAliases(transcript || "");
    if (!parsed) {
      return "";
    }

    parsed = normalizeSpokenNumberPhrases(parsed);

    if (/^(clear|reset|all clear)$/.test(parsed)) {
      return "clear";
    }

    if (/^(equals|equal to|calculate|compute)$/.test(parsed)) {
      return "=";
    }

    parsed = parsed.replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/g, "(($1/100)*$2)");
    parsed = parsed.replace(/(\d+(?:\.\d+)?)\s+percent\s+of\s+(\d+(?:\.\d+)?)/g, "(($1/100)*$2)");
    parsed = parsed.replace(/(\d+(?:\.\d+)?)\s+percent\b/g, "percent($1)");
    parsed = applyPhraseReplacements(parsed);
    parsed = parsed.replace(/\bsquared\b/g, "**2");
    parsed = parsed.replace(/\bcubed\b/g, "**3");
    parsed = parsed.replace(/\bpi\b/g, "pi");
    parsed = parsed.replace(/\be\b/g, "e");
    parsed = parsed.replace(/\brand\b/g, "rand()");
    parsed = parsed.replace(/\s+/g, " ").trim();

    const tokens = parsed.split(" ").filter(Boolean);
    return compileVoiceTokens(tokens)
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
  }

  function evaluateExpression(expression, options = {}) {
    const { lastAnswer = 0, isDegreeMode = false } = options;
    const normalized = normalizeTypedExpression(expression)
      .replace(/\bans\b/g, `(${lastAnswer})`)
      .replace(/\bpi\b/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`);

    if (!normalized) {
      return { ok: true, value: 0 };
    }

    try {
      const scope = createScope(isDegreeMode);
      const evaluator = new Function(
        ...Object.keys(scope),
        `"use strict"; return (${normalized});`
      );
      const value = evaluator(...Object.values(scope));
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
    evaluateExpression,
    normalizeTypedExpression,
    normalizeSpeechAliases,
    normalizeSpokenNumberPhrases,
    formatNumber
  };

  global.OrbitMath = api;
  global.VoiceMath = {
    parseSpokenMath,
    tryEvaluate: evaluateExpression,
    normalizeSpokenNumberPhrases,
    normalizeSpeechAliases,
    formatNumber
  };
}(typeof globalThis !== "undefined" ? globalThis : window));
