import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";

import { findLockableIdentifiers } from "./editor-decorations";

type MonacoRangeConstructor = new (startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) => unknown;

type MonacoApi = {
  Range: MonacoRangeConstructor;
};

type MonacoWord = { word: string } | null;
type MonacoModel = {
  getWordAtPosition: (position: unknown) => MonacoWord;
  getLineCount: () => number;
  getLineContent: (lineNumber: number) => string;
};

type MonacoEditor = {
  onMouseDown: (handler: (event: { target: { position?: unknown } }) => void) => { dispose: () => void };
  getModel: () => MonacoModel | null;
  deltaDecorations: (oldDecorations: string[], decorations: unknown[]) => string[];
  updateOptions: (options: { readOnly: boolean; mouseStyle: "copy" | "text" }) => void;
  isDisposed?: () => boolean;
};

type EditorApi = {
  editor: MonacoEditor;
  monaco: MonacoApi;
};

type UseEditorDecorationsOptions = {
  activeExecutionLine: number | null;
  isPythonIdentifier: (value: string) => boolean;
  selectableIdentifiers: string[];
  draftHighlightIdentifier: string | null;
  onIdentifierClick: (identifier: string) => void;
  selectionEnabled: boolean;
};

export type EditorMountHandler = OnMount;

export const useEditorDecorations = ({
  activeExecutionLine,
  isPythonIdentifier,
  selectableIdentifiers,
  draftHighlightIdentifier,
  onIdentifierClick,
  selectionEnabled,
}: UseEditorDecorationsOptions) => {
  const [editorApi, setEditorApi] = useState<EditorApi | null>(null);
  const clickDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const currentDecorationsRef = useRef<string[]>([]);

  const selectableIdentifierSet = useMemo(() => new Set(selectableIdentifiers), [selectableIdentifiers]);

  const handleEditorMount = useCallback<EditorMountHandler>((editor, monaco) => {
    setEditorApi({ editor: editor as unknown as MonacoEditor, monaco: monaco as unknown as MonacoApi });
  }, []);

  useEffect(() => {
    const editor = editorApi?.editor;
    clickDisposableRef.current?.dispose();
    clickDisposableRef.current = null;
    if (!editor || selectionEnabled !== true) {
      return undefined;
    }

    clickDisposableRef.current = editor.onMouseDown((event) => {
      const position = event.target.position;
      if (!position) {
        return;
      }
      const model = editor.getModel();
      if (!model) {
        return;
      }
      const word = model.getWordAtPosition(position);
      if (!word?.word || !isPythonIdentifier(word.word) || !selectableIdentifierSet.has(word.word)) {
        return;
      }
      onIdentifierClick(word.word);
    });

    return () => {
      clickDisposableRef.current?.dispose();
      clickDisposableRef.current = null;
    };
  }, [editorApi, isPythonIdentifier, onIdentifierClick, selectableIdentifierSet, selectionEnabled]);

  useEffect(() => {
    const editor = editorApi?.editor;
    const monaco = editorApi?.monaco;
    if (!editor || !monaco || (typeof editor.isDisposed === "function" && editor.isDisposed())) {
      return;
    }

    const decorations: unknown[] = [];
    if (selectionEnabled || draftHighlightIdentifier) {
      const model = editor.getModel();
      const lineCount = model?.getLineCount() ?? 0;
      if (!model) {
        return;
      }
      for (let lineNumber = 1; lineNumber <= lineCount; lineNumber += 1) {
        const line = model.getLineContent(lineNumber);
        for (const identifier of findLockableIdentifiers(line, (value) => isPythonIdentifier(value) && selectableIdentifierSet.has(value))) {
          const isDraftMatch = identifier.word === draftHighlightIdentifier;
          if (!selectionEnabled && !isDraftMatch) {
            continue;
          }
          const highlightClassName = isDraftMatch
            ? "editor-lockable-identifier editor-lockable-identifier-draft"
            : "editor-lockable-identifier";
          decorations.push({
            range: new monaco.Range(lineNumber, identifier.startColumn, lineNumber, identifier.endColumn),
            options: {
              inlineClassName: highlightClassName,
              hoverMessage: { value: isDraftMatch ? "Matches the current advanced selection root." : "Click to add this variable to watch." },
            },
          });
        }
      }
    }

    if (activeExecutionLine != null) {
      decorations.push({
        range: new monaco.Range(activeExecutionLine, 1, activeExecutionLine, 1),
        options: {
          isWholeLine: true,
          className: "editor-current-line",
          glyphMarginClassName: "editor-current-line-glyph",
        },
      });
    }

    try {
      currentDecorationsRef.current = editor.deltaDecorations(currentDecorationsRef.current, decorations);
      editor.updateOptions({ readOnly: selectionEnabled, mouseStyle: selectionEnabled ? "copy" : "text" });
    } catch {
      // Monaco can dispose between React passes during remount; skip stale updates.
    }
  }, [activeExecutionLine, draftHighlightIdentifier, editorApi, isPythonIdentifier, selectableIdentifierSet, selectionEnabled]);

  useEffect(() => () => {
    clickDisposableRef.current?.dispose();
    clickDisposableRef.current = null;
    currentDecorationsRef.current = [];
  }, []);

  return { handleEditorMount };
};
