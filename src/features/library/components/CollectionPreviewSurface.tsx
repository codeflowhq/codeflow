import { Suspense, lazy } from "react";
import { Button, Tag, Typography } from "antd";

import { getCollectionPreviewEntries } from "../collectionPreview";
import type { ManifestEntry } from "../../../shared/types/visualization";

const SvgPanel = lazy(() => import("../../visualization/renderers/SvgPanel"));
const GraphvizPanel = lazy(() => import("../../visualization/renderers/GraphvizPanel"));

const { Text } = Typography;

type CollectionPreviewSurfaceProps = {
  savedManifest?: ManifestEntry[];
  expanded: boolean;
  onToggle: () => void;
};

const CollectionPreviewSurface = ({ savedManifest, expanded, onToggle }: CollectionPreviewSurfaceProps) => {
  const previewEntries = getCollectionPreviewEntries(savedManifest);

  if (!previewEntries.length) {
    return (
      <div className="collection-preview-card collection-preview-empty">
        <Text strong>Preview</Text>
        <Text type="secondary">No visualization was saved with this project yet.</Text>
      </div>
    );
  }

  return (
    <div className="collection-preview-card">
      <div className="collection-preview-head">
        <div>
          <Text strong>Preview</Text>
          <div><Text type="secondary">{savedManifest?.length ?? 0} panel(s)</Text></div>
        </div>
        <Button size="small" onClick={onToggle}>
          {expanded ? "Hide preview" : "Show preview"}
        </Button>
      </div>
      {expanded ? (
        <div className="collection-preview-grid">
          {previewEntries.map((entry) => (
            <div key={entry.variable} className="collection-preview-panel">
              <div className="collection-preview-panel-head">
                <Text strong>{entry.variable}</Text>
                <Tag>{entry.kind}</Tag>
              </div>
              <div className="collection-preview-panel-body">
                {entry.kind === "svg" && entry.previewStep?.svg ? (
                  <Suspense fallback={<div className="collection-preview-thumbnail collection-preview-thumbnail-placeholder"><Text type="secondary">Loading preview…</Text></div>}>
                    <div className="collection-preview-thumbnail" aria-label={`${entry.variable} preview`}>
                      <SvgPanel svg={entry.previewStep.svg} />
                    </div>
                  </Suspense>
                ) : null}
                {entry.kind === "dot" && entry.previewStep?.dot ? (
                  <Suspense fallback={<div className="collection-preview-thumbnail collection-preview-thumbnail-placeholder"><Text type="secondary">Loading preview…</Text></div>}>
                    <div className="collection-preview-thumbnail" aria-label={`${entry.variable} preview`}>
                      <GraphvizPanel dot={entry.previewStep.dot} debugName={`collection-preview-${entry.variable}`} animate={false} />
                    </div>
                  </Suspense>
                ) : null}
                <Text type="secondary">{entry.frameCount} saved frame(s)</Text>
                <div className="watch-chip-row">
                  {entry.compatibleViewKinds.slice(0, 2).map((viewKind) => (
                    <Tag key={`${entry.variable}-${viewKind}`}>{viewKind}</Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="collection-preview-collapsed">
          {previewEntries.map((entry) => (
            <Tag key={entry.variable}>{entry.variable}</Tag>
          ))}
          <Text type="secondary">Expand to load visual thumbnails.</Text>
        </div>
      )}
    </div>
  );
};

export default CollectionPreviewSurface;
