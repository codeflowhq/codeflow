import { useMemo, useState } from "react";
import { Button, Card, Empty, Input, Select, Space, Tag, Typography } from "antd";

import CollectionPreviewSurface from "./components/CollectionPreviewSurface";
import { getCollectionMetadata } from "./collectionPreview";
import type { CollectionRecord, ExampleRecord } from "../../shared/types/visualization";

const { Search } = Input;
const { Paragraph, Text, Title } = Typography;

type CollectionsPageProps = {
  collections: CollectionRecord[];
  examples: ExampleRecord[];
  onDeleteCollection: (record: CollectionRecord) => void;
  onLoadCollection: (record: CollectionRecord) => void;
  onLoadExample: (example: ExampleRecord) => void;
};

const CollectionsPage = ({ collections, examples, onDeleteCollection, onLoadCollection, onLoadExample }: CollectionsPageProps) => {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<string[]>([]);

  const tags = useMemo(() => {
    const values = new Set<string>();
    examples.forEach((example) => example.tags?.forEach((tag) => values.add(tag)));
    return ["all", ...Array.from(values).sort()];
  }, [examples]);

  const filteredExamples = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return examples.filter((example) => {
      const matchesTag = tagFilter === "all" || example.tags?.includes(tagFilter);
      if (!matchesTag) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${example.title} ${example.description} ${(example.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [examples, query, tagFilter]);

  const togglePreview = (recordId: string) => {
    setExpandedPreviewIds((prev) => (prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]));
  };

  return (
    <div className="collections-page-shell">
      <div className="workspace-page-header workspace-page-header-stack">
        <Title level={1} className="collections-page-title">Collections</Title>
        <Paragraph type="secondary" className="collections-page-copy">
          Saved projects keep code, watched variables, variable settings, and any rendered visualization panels available at save time.
        </Paragraph>
      </div>

      <Card className="surface-card" title="Saved projects">
        {collections.length ? (
          <div className="collection-card-grid">
            {collections.map((record) => {
              const metadata = getCollectionMetadata(record);
              const previewExpanded = expandedPreviewIds.includes(record.id);
              return (
                <Card key={record.id} className="surface-card surface-card-subtle collection-record-card">
                  <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                    <div className="collection-record-header">
                      <div>
                        <Text strong>{record.name}</Text>
                        <div><Text type="secondary">Saved {new Date(record.savedAt).toLocaleString()}</Text></div>
                      </div>
                      <Space>
                        <Button type="primary" onClick={() => onLoadCollection(record)}>Load</Button>
                        <Button danger onClick={() => onDeleteCollection(record)}>Delete</Button>
                      </Space>
                    </div>
                    <div className="collection-preview-meta">
                      <Tag color="blue">{metadata.watchCount} watches</Tag>
                      <Tag color="purple">{metadata.visualCount} visuals</Tag>
                      <Tag>{metadata.lineCount} lines</Tag>
                      <Tag>{metadata.characterCount} chars</Tag>
                    </div>
                    <CollectionPreviewSurface
                      savedManifest={record.savedManifest}
                      expanded={previewExpanded}
                      onToggle={() => togglePreview(record.id)}
                    />
                  </Space>
                </Card>
              );
            })}
          </div>
        ) : <Empty description="No saved collections." />}
      </Card>

      <Card className="surface-card" title="Examples">
        <Space wrap style={{ marginBottom: 12 }}>
          <Search value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search examples" style={{ width: 240 }} />
          <Select value={tagFilter} options={tags.map((tag) => ({ label: tag, value: tag }))} onChange={setTagFilter} style={{ width: 180 }} />
        </Space>
        <div className="examples-list">
          {filteredExamples.map((example) => (
            <div key={example.key} className="examples-list-item">
              <div className="examples-list-copy">
                <Text strong>{example.title}</Text>
                <Space orientation="vertical" size={4}>
                  <Text type="secondary">{example.description}</Text>
                  <Space wrap>
                    {example.tags?.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </Space>
              </div>
              <Button type="primary" onClick={() => onLoadExample(example)}>
                Open example
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CollectionsPage;
