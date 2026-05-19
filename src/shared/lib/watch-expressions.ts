const PYTHON_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import",
  "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const PYTHON_BUILTINS = new Set([
  "abs", "all", "any", "bool", "dict", "enumerate", "filter", "float", "int", "len", "list",
  "map", "max", "min", "print", "range", "reversed", "round", "set", "sorted", "str", "sum",
  "tuple", "type", "zip",
]);

const TEMPORARY_LOOP_NAMES = new Set(["_", "i", "j", "k", "idx", "index"]);
const WATCH_EXPRESSION_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(?:\[[^\]\n]+\]|\.[A-Za-z_][A-Za-z0-9_]*)*$/;
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

type CandidateEntry = {
  name: string;
  sources: Set<string>;
  score: number;
};

export const parseWatchInput = (input: string): string[] =>
  input
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token && isWatchExpression(token));

export const serializeWatchVariables = (variables: string[]): string => variables.join(", ");

export const isPythonIdentifier = (value: string): boolean =>
  IDENTIFIER_PATTERN.test(value) && !PYTHON_KEYWORDS.has(value) && !PYTHON_BUILTINS.has(value);


export const getWatchExpressionRoot = (value: string): string | null =>
  value.trim().match(/^[A-Za-z_][A-Za-z0-9_]*/)?.[0] ?? null;

export const isWatchExpression = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (!WATCH_EXPRESSION_PATTERN.test(trimmed)) {
    return false;
  }
  const root = trimmed.match(/^[A-Za-z_][A-Za-z0-9_]*/)?.[0];
  return root != null && isPythonIdentifier(root);
};

const stripStringsAndComments = (sourceCode: string): string => {
  let result = "";
  let quote: string | null = null;
  let tripleQuote: string | null = null;

  for (let index = 0; index < sourceCode.length; index += 1) {
    const char = sourceCode[index];
    const prev = sourceCode[index - 1];
    const nextThree = sourceCode.slice(index, index + 3);

    if (tripleQuote) {
      if (nextThree === tripleQuote) {
        result += "   ";
        index += 2;
        tripleQuote = null;
      } else {
        result += char === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (quote) {
      result += char === "\n" ? "\n" : " ";
      if (char === quote && prev !== "\\") {
        quote = null;
      }
      continue;
    }

    if (nextThree === "'''" || nextThree === '"""') {
      tripleQuote = nextThree;
      result += "   ";
      index += 2;
      continue;
    }

    if (char === "#") {
      while (index < sourceCode.length && sourceCode[index] !== "\n") {
        result += " ";
        index += 1;
      }
      if (index < sourceCode.length) {
        result += "\n";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      result += " ";
      continue;
    }

    result += char;
  }

  return result;
};

const splitTopLevelTargets = (targetText: string): string[] => {
  const targets: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < targetText.length; index += 1) {
    const char = targetText[index];
    if (char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      depth = Math.max(0, depth - 1);
    } else if (char === "," && depth === 0) {
      targets.push(targetText.slice(start, index).trim());
      start = index + 1;
    }
  }
  targets.push(targetText.slice(start).trim());
  return targets;
};

const normalizeTarget = (target: string): string => {
  let value = target.trim();
  while ((value.startsWith("(") && value.endsWith(")")) || (value.startsWith("[") && value.endsWith("]"))) {
    value = value.slice(1, -1).trim();
  }
  return value.replace(/^\*+/, "").trim();
};

const addCandidate = (candidates: Map<string, CandidateEntry>, name: string, source: string): void => {
  if (!isPythonIdentifier(name)) {
    return;
  }
  const current = candidates.get(name) ?? { name, sources: new Set<string>(), score: 0 };
  current.sources.add(source);
  const sourceWeight = source === "assignment" ? 30 : source === "mutation" ? 24 : source === "with" ? 18 : source === "for" ? 10 : 4;
  const tempPenalty = TEMPORARY_LOOP_NAMES.has(name) ? 8 : 0;
  current.score = Math.max(current.score, sourceWeight - tempPenalty);
  candidates.set(name, current);
};

const extractNamesFromTargets = (targetText: string): string[] => {
  const names: string[] = [];
  for (const rawTarget of splitTopLevelTargets(targetText)) {
    const target = normalizeTarget(rawTarget);
    if (!target || target.includes(".") || target.includes("[")) {
      const root = target.match(/^[A-Za-z_][A-Za-z0-9_]*/)?.[0];
      if (root) {
        names.push(root);
      }
      continue;
    }
    if (IDENTIFIER_PATTERN.test(target)) {
      names.push(target);
    }
  }
  return names;
};

const extractAssignmentTargets = (line: string): string[] => {
  const match = line.match(/^\s*(?:global\s+|nonlocal\s+)?(.+?)\s*(?::[^=]+)?\s*(?:=|\+=|-=|\*=|\/=|\/\/=|%=|\*\*=|:=)/);
  if (!match) {
    return [];
  }
  const left = match[1].trim();
  if (/^(if|while|for|return|yield|assert|with|elif|except)\b/.test(left)) {
    return [];
  }
  return extractNamesFromTargets(left);
};

const extractForTargets = (line: string): string[] => {
  const match = line.match(/^\s*(?:async\s+)?for\s+(.+?)\s+in\s+/);
  return match ? extractNamesFromTargets(match[1]) : [];
};

const extractWithTargets = (line: string): string[] => {
  const names: string[] = [];
  const pattern = /\bas\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  for (const match of line.matchAll(pattern)) {
    names.push(match[1]);
  }
  return names;
};

const extractMutationReceivers = (line: string): string[] => {
  const names: string[] = [];
  const pattern = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*(append|extend|insert|remove|pop|popleft|appendleft|clear|update|add|discard)\s*\(/g;
  for (const match of line.matchAll(pattern)) {
    names.push(match[1]);
  }
  return names;
};

export const extractCandidateVariables = (sourceCode: string): string[] => {
  const sanitized = stripStringsAndComments(sourceCode);
  const candidates = new Map<string, CandidateEntry>();

  sanitized.split("\n").forEach((line) => {
    extractAssignmentTargets(line).forEach((name) => addCandidate(candidates, name, "assignment"));
    extractForTargets(line).forEach((name) => addCandidate(candidates, name, "for"));
    extractWithTargets(line).forEach((name) => addCandidate(candidates, name, "with"));
    extractMutationReceivers(line).forEach((name) => addCandidate(candidates, name, "mutation"));
  });

  return [...candidates.values()]
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .map((candidate) => candidate.name)
    .slice(0, 50);
};
