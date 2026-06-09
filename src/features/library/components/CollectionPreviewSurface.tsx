import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Suspense, lazy, useState } from "react";
import { Button, Typography } from "antd";

import { getCollectionPreviewEntries } from "../collectionPreview";
import type { ManifestEntry } from "../../../shared/types/visualization";

const SvgPanel = lazy(() => import("../../visualization/renderers/SvgPanel"));
const GraphvizPanel = lazy(() => import("../../visualization/renderers/GraphvizPanel"));

const { Text } = Typography;

type CollectionPreviewSurfaceProps = {
  savedManifest?: ManifestEntry[];
};

const CollectionPreviewSurface = ({ savedManifest }: CollectionPreviewSurfaceProps) => {
  const previewEntries = getCollectionPreviewEntries(savedManifest);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!previewEntries.length) {
    return (
      <div className="collection-preview-card collection-preview-empty">
        <Text type="secondary">No visualization was saved with this project yet.</Text>
      </div>
    );
  }

  const activeEntry = previewEntries[activeIndex] ?? previewEntries[0];
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < previewEntries.length - 1;

  return (
    <div className="collection-preview-card">
      <div className="collection-preview-stage">
        {previewEntries.length > 1 ? (
          <>
            <Button
              className="collection-preview-arrow collection-preview-arrow-left"
              size="small"
              shape="circle"
              icon={<LeftOutlined />}
              disabled={!canGoPrevious}
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              aria-label="Previous preview"
            />
            <Button
              className="collection-preview-arrow collection-preview-arrow-right"
              size="small"
              shape="circle"
              icon={<RightOutlined />}
              disabled={!canGoNext}
              onClick={() => setActiveIndex((prev) => Math.min(previewEntries.length - 1, prev + 1))}
              aria-label="Next preview"
            />
          </>
        ) : null}
        {activeEntry.kind === "svg" && activeEntry.previewStep?.svg ? (
          <Suspense fallback={<div className="collection-preview-thumbnail collection-preview-thumbnail-placeholder"><Text type="secondary">Loading preview…</Text></div>}>
            <div className="collection-preview-thumbnail" aria-label={`${activeEntry.variable} preview`}>
              <SvgPanel svg={activeEntry.previewStep.svg} />
            </div>
          </Suspense>
        ) : null}
        {activeEntry.kind === "dot" && activeEntry.previewStep?.dot ? (
          <Suspense fallback={<div className="collection-preview-thumbnail collection-preview-thumbnail-placeholder"><Text type="secondary">Loading preview…</Text></div>}>
            <div className="collection-preview-thumbnail" aria-label={`${activeEntry.variable} preview`}>
              <GraphvizPanel dot={activeEntry.previewStep.dot} debugName={`collection-preview-${activeEntry.variable}`} animate={false} />
            </div>
          </Suspense>
        ) : null}
      </div>
    </div>
  );
};

export default CollectionPreviewSurface;
