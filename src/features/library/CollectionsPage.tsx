import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Empty, Input, Select, Space, Tag, Typography } from "antd";

import CollectionPreviewSurface from "./components/CollectionPreviewSurface";
import type { CollectionRecord, ExampleRecord } from "../../shared/types/visualization";
import { defaultGlobalConfig } from "../../configDefaults";
import { buildVisualizationRuntimeConfig } from "../../runtime/runtime-config";
import { initializeBrowserRuntime, runVisualizationInBrowser } from "../../runtime/python-bridge";
import type { ManifestEntry } from "../../shared/types/visualization";
import FeatureBoundary from "../../shared/ui/FeatureBoundary";

const { Search } = Input;
const { Text, Title } = Typography;
const MAX_CONCURRENT_EXAMPLE_PREVIEWS = 3;
const EXAMPLE_TOPIC_ORDER = [
  "All topics",
  "Arrays & Sorting",
  "Linear Structures & Maps",
  "Trees & Range Structures",
  "Graphs & Graph Algorithms",
  "Search & Game AI",
  "Machine Learning",
  "Recursion",
  "Strings",
  "Special Media",
] as const;

type ExampleTopic = typeof EXAMPLE_TOPIC_ORDER[number];

const getExampleTopic = (example: ExampleRecord): ExampleTopic => {
  const tags = new Set(example.tags ?? []);
  if (tags.has("image") || tags.has("special") || tags.has("asset required")) {
    return "Special Media";
  }
  if (tags.has("machine learning") || tags.has("decision tree") || tags.has("linear regression") || tags.has("regression")) {
    return "Machine Learning";
  }
  if (tags.has("search") || tags.has("heuristic") || tags.has("local search") || tags.has("adversarial") || tags.has("minimax") || tags.has("alpha-beta") || tags.has("hill climbing")) {
    return "Search & Game AI";
  }
  if (tags.has("recursion") || tags.has("call trace")) {
    return "Recursion";
  }
  if (tags.has("string") || tags.has("suffix array")) {
    return "Strings";
  }
  if (tags.has("graph") || tags.has("queue") || tags.has("dfs") || tags.has("mst") || tags.has("shortest path") || tags.has("union-find") || tags.has("traversal") || tags.has("cycle") || tags.has("pointer")) {
    return "Graphs & Graph Algorithms";
  }
  if (tags.has("tree") || tags.has("heap") || tags.has("bst") || tags.has("avl") || tags.has("fenwick") || tags.has("segment tree") || tags.has("range query")) {
    return "Trees & Range Structures";
  }
  if (tags.has("dict") || tags.has("map") || tags.has("hash table") || tags.has("table") || tags.has("linked list") || tags.has("nested")) {
    return "Linear Structures & Maps";
  }
  return "Arrays & Sorting";
};

type CollectionsPageProps = {
  collections: CollectionRecord[];
  examples: ExampleRecord[];
  onDeleteCollection: (record: CollectionRecord) => Promise<void>;
  onLoadCollection: (record: CollectionRecord) => Promise<void>;
  onLoadExample: (example: ExampleRecord) => Promise<void>;
};

const CollectionsPage = ({ collections, examples, onDeleteCollection, onLoadCollection, onLoadExample }: CollectionsPageProps) => {
  const [savedQuery, setSavedQuery] = useState("");
  const [savedLabelFilter, setSavedLabelFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<ExampleTopic>("All topics");
  const [examplePreviews, setExamplePreviews] = useState<Record<string, ManifestEntry[]>>({});
  const [examplePreviewStatus, setExamplePreviewStatus] = useState<Record<string, "loading" | "ready" | "error">>({});
  const [visibleExampleKeys, setVisibleExampleKeys] = useState<Record<string, true>>({});
  const previewObserverRef = useRef<IntersectionObserver | null>(null);
  const previewNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inFlightExamplePreviewKeysRef = useRef(new Set<string>());
  const isMountedRef = useRef(true);

  const savedLabels = useMemo(() => {
    const values = new Set<string>();
    collections.forEach((record) => record.labels?.forEach((label) => values.add(label)));
    return ["all", ...Array.from(values).sort()];
  }, [collections]);
  const savedLabelOptions = useMemo(
    () => savedLabels.map((label) => ({ label: label === "all" ? "All labels" : label, value: label })),
    [savedLabels],
  );

  const filteredCollections = useMemo(() => {
    const normalizedQuery = savedQuery.trim().toLowerCase();
    return collections.filter((record) => {
      if (savedLabelFilter !== "all" && !record.labels?.includes(savedLabelFilter)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${record.name} ${record.description ?? ""} ${(record.labels ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [collections, savedLabelFilter, savedQuery]);
  const exampleTopics = useMemo(
    () => EXAMPLE_TOPIC_ORDER.filter((topic) => topic === "All topics" || examples.some((example) => getExampleTopic(example) === topic)),
    [examples],
  );
  const topicOptions = useMemo(
    () => exampleTopics.map((topic) => ({ label: topic, value: topic })),
    [exampleTopics],
  );

  const filteredExamples = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return examples.filter((example) => {
      const matchesTopic = topicFilter === "All topics" || getExampleTopic(example) === topicFilter;
      if (!matchesTopic) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${example.title} ${example.description} ${(example.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [examples, query, topicFilter]);
  const groupedExamples = useMemo(() => {
    const groups = new Map<ExampleTopic, ExampleRecord[]>();
    filteredExamples.forEach((example) => {
      const topic = getExampleTopic(example);
      const entries = groups.get(topic) ?? [];
      entries.push(example);
      groups.set(topic, entries);
    });
    return EXAMPLE_TOPIC_ORDER
      .filter((topic) => topic !== "All topics")
      .map((topic) => ({ topic, examples: groups.get(topic) ?? [] }))
      .filter((group) => group.examples.length > 0);
  }, [filteredExamples]);
  const visibleExampleKeySet = useMemo(() => new Set(Object.keys(visibleExampleKeys)), [visibleExampleKeys]);

  useEffect(() => {
    void initializeBrowserRuntime().catch(() => undefined);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      const intersectingKeys = entries.flatMap((entry) => {
        if (!entry.isIntersecting) {
          return [];
        }
        const key = (entry.target as HTMLDivElement).dataset.exampleKey;
        return key ? [key] : [];
      });
      if (intersectingKeys.length === 0) {
        return;
      }
      setVisibleExampleKeys((prev) => {
        let changed = false;
        const next = { ...prev };
        intersectingKeys.forEach((key) => {
          if (next[key] !== true) {
            next[key] = true;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, { rootMargin: "240px 0px" });
    previewObserverRef.current = observer;
    Object.values(previewNodeRefs.current).forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });
    return () => {
      observer.disconnect();
      if (previewObserverRef.current === observer) {
        previewObserverRef.current = null;
      }
    };
  }, []);

  const registerPreviewNode = useCallback((key: string, node: HTMLDivElement | null) => {
    const previousNode = previewNodeRefs.current[key];
    if (previousNode && previewObserverRef.current) {
      previewObserverRef.current.unobserve(previousNode);
    }
    if (node) {
      previewNodeRefs.current[key] = node;
      if (typeof IntersectionObserver === "undefined") {
        setVisibleExampleKeys((prev) => (prev[key] === true ? prev : { ...prev, [key]: true }));
        return;
      }
      previewObserverRef.current?.observe(node);
      return;
    }
    delete previewNodeRefs.current[key];
  }, []);

  useEffect(() => {
    const loadingCount = Object.values(examplePreviewStatus).filter((status) => status === "loading").length;
    const availableSlots = MAX_CONCURRENT_EXAMPLE_PREVIEWS - loadingCount;
    if (availableSlots <= 0) {
      return;
    }
    const nextExamples = filteredExamples
      .filter((example) => (
        visibleExampleKeySet.has(example.key)
        && examplePreviewStatus[example.key] == null
        && !inFlightExamplePreviewKeysRef.current.has(example.key)
      ))
      .slice(0, availableSlots);
    if (nextExamples.length === 0) {
      return;
    }

    nextExamples.forEach((example) => {
      inFlightExamplePreviewKeysRef.current.add(example.key);
    });
    setExamplePreviewStatus((prev) => {
      const next = { ...prev };
      nextExamples.forEach((example) => {
        next[example.key] = "loading";
      });
      return next;
    });

    nextExamples.forEach((example) => {
      void (async () => {
        const finalize = (status: "ready" | "error", manifest: ManifestEntry[]) => {
          inFlightExamplePreviewKeysRef.current.delete(example.key);
          if (!isMountedRef.current) {
            return;
          }
          setExamplePreviews((prev) => ({ ...prev, [example.key]: manifest }));
          setExamplePreviewStatus((prev) => ({ ...prev, [example.key]: status }));
        };

        try {
          const result = await runVisualizationInBrowser({
            snippet: example.snippet,
            watch: example.watchVariables?.length ? example.watchVariables : ["data"],
            config: buildVisualizationRuntimeConfig({
              globalConfig: { ...defaultGlobalConfig, ...(example.globalConfig ?? {}) },
              variableConfigs: example.variableConfigs ?? {},
            }),
          });
          finalize("ready", result.manifest);
        } catch {
          finalize("error", []);
        }
      })();
    });
  }, [examplePreviewStatus, filteredExamples, visibleExampleKeySet]);

  return (
    <div className="collections-page-shell">
      <div className="workspace-page-header">
        <Title level={1} className="collections-page-title">Collections</Title>
      </div>

      <Card className="surface-card" title="Saved projects">
        <Space wrap className="collection-filter-bar">
          <Search value={savedQuery} onChange={(event) => setSavedQuery(event.target.value)} placeholder="Search saved projects" style={{ width: 240 }} />
          <Select
            value={savedLabelFilter}
            options={savedLabelOptions}
            onChange={setSavedLabelFilter}
            style={{ width: 180 }}
          />
        </Space>
        {filteredCollections.length ? (
          <div className="collection-card-grid">
            {filteredCollections.map((record) => {
              return (
                <Card key={record.id} className="surface-card surface-card-subtle collection-record-card">
                  <div className="collection-record-layout">
                    <div className="collection-record-copy">
                      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                        <div className="collection-record-header">
                          <div>
                            <Text strong>{record.name}</Text>
                            <div>
                              <Text type="secondary">
                                Saved {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.savedAt))}
                              </Text>
                            </div>
                          </div>
                        </div>
                        {record.description ? <Text type="secondary">{record.description}</Text> : null}
                        {record.labels?.length ? (
                          <Space wrap size={[6, 6]}>
                            {record.labels.map((label) => <Tag key={label}>{label}</Tag>)}
                          </Space>
                        ) : null}
                      </Space>
                      <Space className="collection-record-actions">
                        <Button type="primary" onClick={() => void onLoadCollection(record)}>Open project</Button>
                        <Button danger type="text" onClick={() => void onDeleteCollection(record)}>Delete</Button>
                      </Space>
                    </div>
                    <div className="collection-record-preview">
                      <FeatureBoundary title="The saved preview failed to render.">
                        <CollectionPreviewSurface savedManifest={record.savedManifest} />
                      </FeatureBoundary>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : <Empty description={collections.length ? "No saved projects match the current filters." : "No saved collections."} />}
      </Card>

      <Card className="surface-card" title="Examples">
        <Space wrap className="collection-filter-bar">
          <Search value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search examples" style={{ width: 240 }} />
          <Select value={topicFilter} options={topicOptions} onChange={setTopicFilter} style={{ width: 220 }} />
        </Space>
        {groupedExamples.length ? groupedExamples.map((group) => (
          <div key={group.topic} style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{group.topic}</Title>
            <div className="collection-card-grid">
              {group.examples.map((example) => (
                <Card key={example.key} className="surface-card surface-card-subtle collection-record-card">
                  <div className="collection-record-layout">
                    <div className="collection-record-copy">
                      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                        <div className="collection-record-header">
                          <div>
                            <Text strong>{example.title}</Text>
                            <div><Text type="secondary">{example.description}</Text></div>
                          </div>
                        </div>
                        {example.tags?.length ? (
                          <Space wrap size={[6, 6]}>
                            {example.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                          </Space>
                        ) : null}
                      </Space>
                      <Space className="collection-record-actions">
                        <Button type="primary" onClick={() => void onLoadExample(example)}>
                          Open example
                        </Button>
                      </Space>
                    </div>
                    <div
                      className="collection-record-preview"
                      data-example-key={example.key}
                      ref={(node) => {
                        registerPreviewNode(example.key, node);
                      }}
                    >
                      <FeatureBoundary title="The example preview failed to render.">
                        <CollectionPreviewSurface
                          savedManifest={examplePreviews[example.key]}
                          isLoading={examplePreviewStatus[example.key] === "loading"}
                          emptyMessage="Preview unavailable."
                        />
                      </FeatureBoundary>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )) : <Empty description="No examples match the current filters." />}
      </Card>
    </div>
  );
};

export default CollectionsPage;
