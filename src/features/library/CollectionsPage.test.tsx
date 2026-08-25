// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
  initializeBrowserRuntimeMock,
  previewShouldThrow,
  runVisualizationInBrowserMock,
} = vi.hoisted(() => ({
  initializeBrowserRuntimeMock: vi.fn(async () => undefined),
  previewShouldThrow: { current: true },
  runVisualizationInBrowserMock: vi.fn(async () => ({ manifest: [] })),
}));

vi.mock("./components/CollectionPreviewSurface", () => ({
  default: () => {
    if (previewShouldThrow.current) {
      throw new Error("preview failed");
    }
    return <div>preview ok</div>;
  },
}));

vi.mock("../../runtime/python-bridge", () => ({
  initializeBrowserRuntime: initializeBrowserRuntimeMock,
  runVisualizationInBrowser: runVisualizationInBrowserMock,
}));

import CollectionsPage from "./CollectionsPage";

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

afterEach(() => {
  previewShouldThrow.current = true;
  vi.restoreAllMocks();
  runVisualizationInBrowserMock.mockReset();
  runVisualizationInBrowserMock.mockResolvedValue({ manifest: [] });
  initializeBrowserRuntimeMock.mockReset();
  initializeBrowserRuntimeMock.mockResolvedValue(undefined);
  delete (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
});

describe("CollectionsPage", () => {
  it("keeps saved project actions visible when a preview crashes", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <CollectionsPage
        collections={[{
          id: "one",
          name: "Demo",
          savedAt: "2026-06-07T00:00:00.000Z",
          sourceCode: "data = [1]",
          watchVariables: ["data"],
          globalConfig: {
            stepLimit: 128,
            maxDepth: 3,
            maxItemsPerView: 50,
            recursionDepthDefault: -1,
            showTitles: false,
            customConverters: "",
            runtimePackages: "",
            runtimeWheels: "",
            typeViewDefaults: {},
          },
          variableConfigs: {},
          savedManifest: [],
        }]}
        examples={[]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("The saved preview failed to render.")).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "Open project" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    consoleError.mockRestore();
  });

  it("shows Visualgo-style example topic groupings separately from saved project labels", async () => {
    previewShouldThrow.current = false;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <CollectionsPage
        collections={[]}
        examples={[
          {
            key: "bfs-queue",
            title: "BFS Queue",
            description: "Queue evolution for breadth-first search.",
            snippet: "queue = []",
            watchVariables: ["queue"],
            tags: ["graph", "queue", "curriculum"],
          },
          {
            key: "array-cells",
            title: "Array Cells",
            description: "Array view with simple indexed updates.",
            snippet: "data = [1, 2]",
            watchVariables: ["data"],
            tags: ["array", "intro"],
          },
        ]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("BFS Queue")).toBeTruthy();
    });

    expect(screen.getByText("Graphs & Graph Algorithms")).toBeTruthy();
    expect(screen.getAllByText("Arrays & Sorting").length).toBeGreaterThan(0);
    expect(screen.getByText("graph")).toBeTruthy();
    expect(screen.getByText("queue")).toBeTruthy();
    expect(screen.getByText("curriculum")).toBeTruthy();
    expect(screen.queryByText("Recursion & Strings")).toBeNull();
    consoleError.mockRestore();
  });

  it("groups search and machine-learning examples under their dedicated topics", async () => {
    previewShouldThrow.current = false;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <CollectionsPage
        collections={[]}
        examples={[
          {
            key: "a-star-search",
            title: "A* Search",
            description: "Heuristic search.",
            snippet: "open_set = []",
            watchVariables: ["open_set"],
            tags: ["search", "heuristic", "curriculum"],
          },
          {
            key: "decision-tree-learning",
            title: "Decision Tree Learning",
            description: "Decision tree learning.",
            snippet: "gains = {}",
            watchVariables: ["gains"],
            tags: ["machine learning", "decision tree", "curriculum"],
          },
        ]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("A* Search")).toBeTruthy();
    });

    expect(screen.getByText("Search & Game AI")).toBeTruthy();
    expect(screen.getByText("Machine Learning")).toBeTruthy();
    consoleError.mockRestore();
  });

  it("preheats the browser runtime when the page opens", async () => {
    previewShouldThrow.current = false;

    render(
      <CollectionsPage
        collections={[]}
        examples={[]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(initializeBrowserRuntimeMock).toHaveBeenCalledTimes(1);
    });
  });

  it("only runs example previews after cards become visible", async () => {
    previewShouldThrow.current = false;

    const observed: Array<Element> = [];
    class IntersectionObserverStub {
      private readonly callback: (entries: Array<{ isIntersecting: boolean; target: Element }>, observer: IntersectionObserver) => void;

      constructor(callback: (entries: Array<{ isIntersecting: boolean; target: Element }>, observer: IntersectionObserver) => void) {
        this.callback = callback;
      }

      observe(target: Element) {
        observed.push(target);
      }

      unobserve() {}

      disconnect() {}

      flushVisible(keys: string[]) {
        this.callback(
          observed
            .filter((target) => keys.includes((target as HTMLDivElement).dataset.exampleKey ?? ""))
            .map((target) => ({
              isIntersecting: true,
              target,
            }) as IntersectionObserverEntry),
          this as unknown as IntersectionObserver,
        );
      }
    }

    const observerInstances: IntersectionObserverStub[] = [];
    (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver =
      class extends IntersectionObserverStub {
        constructor(callback: (entries: Array<{ isIntersecting: boolean; target: Element }>, observer: IntersectionObserver) => void) {
          super(callback);
          observerInstances.push(this);
        }
      } as unknown as typeof IntersectionObserver;

    render(
      <CollectionsPage
        collections={[]}
        examples={[
          {
            key: "bfs-queue",
            title: "BFS Queue",
            description: "Queue evolution for breadth-first search.",
            snippet: "queue = []",
            watchVariables: ["queue"],
            tags: ["graph", "queue", "curriculum"],
          },
          {
            key: "array-cells",
            title: "Array Cells",
            description: "Array view with simple indexed updates.",
            snippet: "data = [1, 2]",
            watchVariables: ["data"],
            tags: ["array", "intro"],
          },
        ]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(observerInstances).toHaveLength(1);
    });

    expect(runVisualizationInBrowserMock).not.toHaveBeenCalled();

    observerInstances[0]?.flushVisible(["bfs-queue"]);

    await waitFor(() => {
      expect(runVisualizationInBrowserMock).toHaveBeenCalledTimes(1);
    });
    const firstPreviewCall = runVisualizationInBrowserMock.mock.calls[0] as unknown as
      | [Record<string, unknown>]
      | undefined;
    expect(firstPreviewCall?.[0]).toMatchObject({
      snippet: "queue = []",
      watch: ["queue"],
    });
  });

  it("limits visible example preview generation to a small concurrent batch", async () => {
    previewShouldThrow.current = false;

    const observed: Array<Element> = [];
    class IntersectionObserverStub {
      private readonly callback: (entries: Array<{ isIntersecting: boolean; target: Element }>, observer: IntersectionObserver) => void;

      constructor(callback: (entries: Array<{ isIntersecting: boolean; target: Element }>, observer: IntersectionObserver) => void) {
        this.callback = callback;
      }

      observe(target: Element) {
        observed.push(target);
      }

      unobserve() {}

      disconnect() {}

      flushVisible(keys: string[]) {
        this.callback(
          observed
            .filter((target) => keys.includes((target as HTMLDivElement).dataset.exampleKey ?? ""))
            .map((target) => ({
              isIntersecting: true,
              target,
            }) as IntersectionObserverEntry),
          this as unknown as IntersectionObserver,
        );
      }
    }

    const observerInstances: IntersectionObserverStub[] = [];
    (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver =
      class extends IntersectionObserverStub {
        constructor(callback: (entries: Array<{ isIntersecting: boolean; target: Element }>, observer: IntersectionObserver) => void) {
          super(callback);
          observerInstances.push(this);
        }
      } as unknown as typeof IntersectionObserver;

    const jobs = [deferred<{ manifest: [] }>(), deferred<{ manifest: [] }>(), deferred<{ manifest: [] }>(), deferred<{ manifest: [] }>()];
    runVisualizationInBrowserMock
      .mockImplementationOnce(() => jobs[0]!.promise)
      .mockImplementationOnce(() => jobs[1]!.promise)
      .mockImplementationOnce(() => jobs[2]!.promise)
      .mockImplementationOnce(() => jobs[3]!.promise);

    render(
      <CollectionsPage
        collections={[]}
        examples={[
          { key: "one", title: "One", description: "One", snippet: "data = [1]", watchVariables: ["data"], tags: ["array"] },
          { key: "two", title: "Two", description: "Two", snippet: "data = [2]", watchVariables: ["data"], tags: ["array"] },
          { key: "three", title: "Three", description: "Three", snippet: "data = [3]", watchVariables: ["data"], tags: ["array"] },
          { key: "four", title: "Four", description: "Four", snippet: "data = [4]", watchVariables: ["data"], tags: ["array"] },
        ]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(observerInstances).toHaveLength(1);
    });

    observerInstances[0]?.flushVisible(["one", "two", "three", "four"]);

    await waitFor(() => {
      expect(runVisualizationInBrowserMock).toHaveBeenCalledTimes(3);
    });

    jobs[0]!.resolve({ manifest: [] });

    await waitFor(() => {
      expect(runVisualizationInBrowserMock).toHaveBeenCalledTimes(4);
    });
  });
});
