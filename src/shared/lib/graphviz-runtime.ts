type GraphvizRuntime = {
  graphviz: typeof import("d3-graphviz").graphviz;
  d3Transition: typeof import("d3-transition").transition;
};

let graphvizRuntimePromise: Promise<GraphvizRuntime> | undefined;

export const loadGraphvizRuntime = async (): Promise<GraphvizRuntime> => {
  if (graphvizRuntimePromise === undefined) {
    graphvizRuntimePromise = Promise.all([
      import("d3-graphviz"),
      import("d3-transition"),
    ]).then(([graphvizModule, transitionModule]) => ({
      graphviz: graphvizModule.graphviz,
      d3Transition: transitionModule.transition,
    }));
  }

  return graphvizRuntimePromise;
};
