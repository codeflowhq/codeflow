import { useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Input, Select, Space, Tag, Typography } from "antd";

import CollectionPreviewSurface from "./components/CollectionPreviewSurface";
import type { CollectionRecord, ExampleRecord } from "../../shared/types/visualization";
import { defaultGlobalConfig } from "../../configDefaults";
import { buildVisualizationRuntimeConfig } from "../../runtime/runtime-config";
import { runVisualizationInBrowser } from "../../runtime/python-bridge";
import type { ManifestEntry } from "../../shared/types/visualization";
import FeatureBoundary from "../../shared/ui/FeatureBoundary";

const { Search } = Input;
const { Text, Title } = Typography;
const EXAMPLE_TOPIC_ORDER = [
  "All topics",
  "Arrays & Sorting",
  "Linear Structures & Maps",
  "Trees & Range Structures",
  "Graphs & Graph Algorithms",
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

  useEffect(() => {
    let cancelled = false;
    const nextExample = filteredExamples.find((example) => !example.savedManifest && !examplePreviews[example.key]);
    if (!nextExample) {
      return;
    }

    void (async () => {
      try {
        const result = await runVisualizationInBrowser({
          snippet: nextExample.snippet,
          watch: nextExample.watchVariables?.length ? nextExample.watchVariables : ["data"],
          config: buildVisualizationRuntimeConfig({
            globalConfig: { ...defaultGlobalConfig, ...(nextExample.globalConfig ?? {}) },
            variableConfigs: nextExample.variableConfigs ?? {},
          }),
        });
        if (!cancelled) {
          setExamplePreviews((prev) => ({ ...prev, [nextExample.key]: result.manifest }));
        }
      } catch {
        if (!cancelled) {
          setExamplePreviews((prev) => ({ ...prev, [nextExample.key]: [] }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examplePreviews, filteredExamples]);

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
                    <div className="collection-record-preview">
                      <FeatureBoundary title="The example preview failed to render.">
                        <CollectionPreviewSurface savedManifest={example.savedManifest ?? examplePreviews[example.key]} />
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
