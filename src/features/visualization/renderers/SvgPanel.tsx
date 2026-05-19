import { useEffect, useRef } from "react";

import { buildSvgTransitionDeclaration, SVG_TRANSITION_TIMEOUT_MS, type SvgTransitionStyles } from "../../../shared/lib/svg-transitions";
import { normalizeGraphRenderError } from "../../../runtime/runtime-errors";

type AnimatableSvgGroup = SVGGElement & { dataset: DOMStringMap & { animKey?: string } };

const assignKeys = (svgRoot: SVGSVGElement) => {
  const groups = svgRoot.querySelectorAll<SVGGElement>("g");
  groups.forEach((group, index) => {
    const typedGroup = group as AnimatableSvgGroup;
    if (!typedGroup.dataset.animKey) {
      const autoKey = typedGroup.getAttribute("id") || `g-${index}`;
      typedGroup.dataset.animKey = autoKey;
    }
  });
};

const collectElements = (svgRoot: SVGSVGElement): AnimatableSvgGroup[] => {
  assignKeys(svgRoot);
  return Array.from(svgRoot.querySelectorAll<SVGGElement>("g[data-anim-key]")) as AnimatableSvgGroup[];
};

const animateElement = (element: SVGGElement, styles: SvgTransitionStyles) => {
  const properties = Object.keys(styles);
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    element.removeEventListener("transitionend", handleTransitionEnd);
    properties.forEach((property) => {
      element.style.removeProperty(property);
    });
    element.style.removeProperty("transition");
    element.style.removeProperty("transform-origin");
    element.style.removeProperty("transform-box");
  };

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.target === element) {
      cleanup();
    }
  };

  element.addEventListener("transitionend", handleTransitionEnd);
  element.style.transition = buildSvgTransitionDeclaration(properties);

  requestAnimationFrame(() => {
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  });

  window.setTimeout(cleanup, SVG_TRANSITION_TIMEOUT_MS);
};

type SvgPanelProps = {
  svg: string;
};

const SvgPanel = ({ svg }: SvgPanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svg) {
      return;
    }

    try {
      const prevSvg = container.querySelector("svg");
    const prevPositions = new Map<string | undefined, DOMRect>();
    if (prevSvg instanceof SVGSVGElement) {
      collectElements(prevSvg).forEach((element) => {
        prevPositions.set((element as AnimatableSvgGroup).dataset.animKey, element.getBoundingClientRect());
      });
    }

    const parser = new DOMParser();
    const nextDoc = parser.parseFromString(svg, "image/svg+xml");
    const nextSvg = nextDoc.querySelector("svg");
    if (!(nextSvg instanceof SVGSVGElement)) {
      container.innerHTML = svg;
      return;
    }

    container.innerHTML = nextSvg.outerHTML;
    const currentSvg = container.querySelector("svg");
    if (!(currentSvg instanceof SVGSVGElement)) {
      return;
    }

    collectElements(currentSvg).forEach((element) => {
      const newRect = element.getBoundingClientRect();
      const prevRect = prevPositions.get(element.dataset.animKey);
      element.style.transition = "none";

      if (prevRect) {
        const dx = prevRect.left - newRect.left;
        const dy = prevRect.top - newRect.top;
        element.style.transformOrigin = "0 0";
        element.style.transformBox = "fill-box";
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          element.style.transform = `translate(${dx}px, ${dy}px)`;
          animateElement(element, { transform: "translate(0px, 0px)" });
        } else {
          element.style.opacity = "0";
          animateElement(element, { opacity: "1" });
        }
      } else {
        element.style.opacity = "0";
        element.style.transformOrigin = "0 0";
        element.style.transformBox = "fill-box";
        element.style.transform = "translateY(8px)";
        animateElement(element, { opacity: "1", transform: "translateY(0)" });
      }
    });
    } catch (error) {
      container.innerHTML = `<div class="panel-loading">${normalizeGraphRenderError(error)}</div>`;
    }
  }, [svg]);

  return <div className="svg-panel" ref={containerRef} />;
};

export default SvgPanel;
