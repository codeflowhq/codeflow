import { useCallback } from "react";
import JSZip from "jszip";

type MessageApi = {
  success: (message: string) => void;
};

type UseExportStateOptions = {
  activeTimelineKey: string;
  exportSources: Record<string, string>;
  messageApi: MessageApi;
  projectName: string;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const svgToPngBlob = async (svg: string): Promise<Blob> => {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("Could not load SVG for PNG export."));
      next.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, image.naturalWidth || image.width || 1);
    canvas.height = Math.max(1, image.naturalHeight || image.height || 1);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas export is unavailable in this browser.");
    }
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("PNG export failed."));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const useExportState = ({ activeTimelineKey, exportSources, messageApi, projectName }: UseExportStateOptions) => {
  const handleExport = useCallback(async () => {
    const exportable = Object.entries(exportSources).filter(([, svg]) => Boolean(svg));

    if (!exportable.length) {
      throw new Error("Nothing exportable is visible right now.");
    }

    const projectSlug = slugify(projectName);
    const zip = new JSZip();

    for (const [variable, svg] of exportable) {
      const baseName = `${projectSlug}-${slugify(variable)}-${slugify(activeTimelineKey)}`;
      const pngBlob = await svgToPngBlob(svg);
      zip.file(`${baseName}.png`, pngBlob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${projectSlug}-visualizations.zip`);
    messageApi.success(`Exported ${exportable.length} visualization${exportable.length === 1 ? "" : "s"}.`);
  }, [activeTimelineKey, exportSources, messageApi, projectName]);

  return { handleExport };
};
