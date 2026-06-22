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
