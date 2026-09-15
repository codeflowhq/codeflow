// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GraphvizPanel from "../features/visualization/renderers/GraphvizPanel";

const loadGraphvizRuntime = vi.fn();

vi.mock("../shared/lib/graphviz-runtime", () => ({
  loadGraphvizRuntime: () => loadGraphvizRuntime(),
}));

describe("GraphvizPanel", () => {
  beforeEach(() => {
    loadGraphvizRuntime.mockReset();
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
      callback(0);
      return 0;
    });
  });

  it("renders nothing extra when the dot source is empty", () => {
    const onSvgChange = vi.fn();

    const { container } = render(<GraphvizPanel dot="" onSvgChange={onSvgChange} />);

    expect(container.querySelector(".graphviz-panel")).toBeTruthy();
    expect(loadGraphvizRuntime).not.toHaveBeenCalled();
    expect(onSvgChange).not.toHaveBeenCalled();
  });

  it("passes rendered svg content to the export callback", async () => {
    loadGraphvizRuntime.mockResolvedValue({
      graphviz: (element: HTMLDivElement) => ({
        zoom: () => ({
          transition: () => ({
            renderDot: async (dot: string) => {
              element.innerHTML = `<svg data-dot="${dot}"></svg>`;
              return undefined;
            },
          }),
          renderDot: async (dot: string) => {
            element.innerHTML = `<svg data-dot="${dot}"></svg>`;
            return undefined;
          },
        }),
        transition: () => ({
          renderDot: async (dot: string) => {
            element.innerHTML = `<svg data-dot="${dot}"></svg>`;
            return undefined;
          },
        }),
        renderDot: async (dot: string) => {
          element.innerHTML = `<svg data-dot="${dot}"></svg>`;
          return undefined;
        },
      }),
      d3Transition: () => ({ duration: vi.fn() }),
    });
    const onSvgChange = vi.fn();

    render(<GraphvizPanel dot="digraph { a -> b }" onSvgChange={onSvgChange} />);

    await waitFor(() => {
      expect(onSvgChange).toHaveBeenCalledWith(
        expect.stringContaining("<svg"),
      );
    });
  });

  it("destroys a graphviz instance when the panel unmounts", async () => {
    const destroy = vi.fn();
    const instance = {
      zoom: vi.fn(),
      destroy,
      renderDot: vi.fn(async () => undefined),
    };
    instance.zoom.mockReturnValue(instance);
    loadGraphvizRuntime.mockResolvedValue({
      graphviz: () => instance,
      d3Transition: () => ({ duration: vi.fn() }),
    });

    const { unmount } = render(<GraphvizPanel dot="digraph { a -> b }" />);

    await waitFor(() => expect(instance.renderDot).toHaveBeenCalled());
    unmount();
    await waitFor(() => expect(destroy).toHaveBeenCalledTimes(1));
  });

  it("uses d3-graphviz keyed transitions for graph updates", async () => {
    const fade = vi.fn();
    const tweenPaths = vi.fn();
    const tweenShapes = vi.fn();
    const growEnteringEdges = vi.fn();
    const keyMode = vi.fn();
    const transition = vi.fn();
    let graphContainer: HTMLDivElement | null = null;
    const renderDot = vi.fn(async (dot: string) => {
      const hasNewEdge = dot.includes("b -> c");
      graphContainer!.innerHTML = `
        <svg data-dot="${dot}">
          <g class="edge"><title>a->b</title><path /></g>
          ${hasNewEdge ? '<g class="edge"><title>b->c</title><path data-entering="true" /></g>' : ""}
        </svg>`;
    });
    const instance = {
      zoom: vi.fn(),
      fade,
      tweenPaths,
      tweenShapes,
      growEnteringEdges,
      keyMode,
      transition,
      renderDot,
    };
    instance.zoom.mockReturnValue(instance);
    instance.fade.mockReturnValue(instance);
    instance.tweenPaths.mockReturnValue(instance);
    instance.tweenShapes.mockReturnValue(instance);
    instance.growEnteringEdges.mockReturnValue(instance);
    instance.keyMode.mockReturnValue(instance);
    instance.transition.mockReturnValue(instance);
    const duration = vi.fn();
    loadGraphvizRuntime.mockResolvedValue({
      graphviz: (element: HTMLDivElement) => {
        graphContainer = element;
        return instance;
      },
      d3Transition: () => ({ duration }),
    });

    const initialDot = "digraph {\n  a [label=a]\n  b [label=b]\n  a -> b\n}";
    const expandedDot = "digraph {\n  a [label=a]\n  b [label=b]\n  c [label=c]\n  a -> b\n  b -> c\n}";
    const { rerender } = render(<GraphvizPanel dot={initialDot} animationMode="graph" />);

    await waitFor(() => expect(renderDot).toHaveBeenCalledTimes(1));
    rerender(<GraphvizPanel dot={expandedDot} animationMode="graph" />);
    await waitFor(() => expect(renderDot).toHaveBeenCalledTimes(2));
    expect(fade).toHaveBeenCalledWith(false);
    expect(tweenPaths).toHaveBeenCalledWith(true);
    expect(tweenShapes).toHaveBeenCalledWith(true);
    expect(growEnteringEdges).toHaveBeenCalledWith(true);
    expect(keyMode).toHaveBeenCalledWith("title");
    expect(transition).toHaveBeenCalledTimes(3);
    transition.mock.calls.forEach(([factory]) => factory());
    await waitFor(() => {
      const path = document.querySelector<SVGPathElement>("path[data-entering='true']");
      expect(path?.dataset.codeflowEdgeGrowth).toBeUndefined();
    });
    expect(duration).toHaveBeenCalledWith(300);
  });

  it("fits intrinsic SVG content into the fixed panel viewport", async () => {
    Object.defineProperty(HTMLDivElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return this.classList.contains("graphviz-panel") ? 480 : 0;
      },
    });

    loadGraphvizRuntime.mockResolvedValue({
      graphviz: (element: HTMLDivElement) => ({
        zoom: () => ({
          transition: () => ({
            renderDot: async () => {
              element.innerHTML = "<svg width='100' height='40'></svg>";
              return undefined;
            },
          }),
          renderDot: async () => {
            element.innerHTML = "<svg width='100' height='40'></svg>";
            return undefined;
          },
        }),
        transition: () => ({
          renderDot: async () => {
            element.innerHTML = "<svg width='100' height='40'></svg>";
            return undefined;
          },
        }),
        renderDot: async () => {
          element.innerHTML = "<svg width='100' height='40'></svg>";
          return undefined;
        },
      }),
      d3Transition: () => ({ duration: vi.fn() }),
    });

    const { container } = render(<GraphvizPanel dot="digraph { a -> b }" fixedViewport />);

    await waitFor(() => {
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect((svg as SVGSVGElement).style.width).toBe("100%");
      expect((svg as SVGSVGElement).style.height).toBe("100%");
    });
  });

  it("scales oversized rendered svg content down to the panel width", async () => {
    Object.defineProperty(HTMLDivElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return this.classList.contains("graphviz-panel") ? 480 : 0;
      },
    });

    loadGraphvizRuntime.mockResolvedValue({
      graphviz: (element: HTMLDivElement) => ({
        zoom: () => ({
          transition: () => ({
            renderDot: async () => {
              element.innerHTML = "<svg width='520' height='80'></svg>";
              return undefined;
            },
          }),
          renderDot: async () => {
            element.innerHTML = "<svg width='520' height='80'></svg>";
            return undefined;
          },
        }),
        transition: () => ({
          renderDot: async () => {
            element.innerHTML = "<svg width='520' height='80'></svg>";
            return undefined;
          },
        }),
        renderDot: async () => {
          element.innerHTML = "<svg width='520' height='80'></svg>";
          return undefined;
        },
      }),
      d3Transition: () => ({ duration: vi.fn() }),
    });

    const { container } = render(<GraphvizPanel dot="digraph { a -> b }" fixedViewport />);

    await waitFor(() => {
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect((svg as SVGSVGElement).style.width).toBe("100%");
      expect((svg as SVGSVGElement).style.maxWidth).toBe("100%");
      expect(container.querySelector(".graphviz-panel")?.getAttribute("data-content-mode")).toBe("fit");
    });
  });

  it("clears the export callback when rendering fails after runtime load", async () => {
    loadGraphvizRuntime.mockResolvedValue({
      graphviz: () => ({
        zoom: () => ({
          transition: () => ({
            renderDot: async () => {
              throw new Error("DOMParser failed");
            },
          }),
          renderDot: async () => {
            throw new Error("DOMParser failed");
          },
        }),
        transition: () => ({
          renderDot: async () => {
            throw new Error("DOMParser failed");
          },
        }),
        renderDot: async () => {
          throw new Error("DOMParser failed");
        },
      }),
      d3Transition: () => ({ duration: vi.fn() }),
    });
    const onSvgChange = vi.fn();

    render(<GraphvizPanel dot="digraph { a -> b }" onSvgChange={onSvgChange} />);

    await waitFor(() => {
      expect(screen.getByText("This SVG output could not be displayed.")).toBeTruthy();
    });
    expect(onSvgChange).toHaveBeenCalledWith(null);
  });

  it("shows a friendly fallback when graph runtime loading fails", async () => {
    loadGraphvizRuntime.mockRejectedValue(new Error('syntax error in line 3 near ">"'));

    render(<GraphvizPanel dot="digraph { a -> b }" />);

    await waitFor(() => {
      expect(screen.getByText("This graph output is not valid for rendering.")).toBeTruthy();
    });
  });
});
