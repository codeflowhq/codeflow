export type LockableIdentifier = {
  word: string;
  startColumn: number;
  endColumn: number;
};

export const findLockableIdentifiers = (
  line: string,
  isPythonIdentifier: (word: string) => boolean,
): LockableIdentifier[] => {
  const identifiers: LockableIdentifier[] = [];
  const identifierPattern = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
  for (const match of line.matchAll(identifierPattern)) {
    const word = match[0];
    if (!word || match.index == null || isPythonIdentifier(word) !== true) {
      continue;
    }
    const startColumn = match.index + 1;
    identifiers.push({
      word,
      startColumn,
      endColumn: startColumn + word.length,
    });
  }
  return identifiers;
};
