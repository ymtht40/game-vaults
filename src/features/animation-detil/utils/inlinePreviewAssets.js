
'use client';

export async function inlinePreviewAssets(htmlCode) {
  if (!htmlCode) {
    return htmlCode;
  }

  const matches = [
    ...htmlCode.matchAll(
      /(?:src|data-anm-image(?:-\d+)?)="(\/preview-assets\/[^"]+)"/g,
    ),
  ];

  let processedHtml = htmlCode;

  for (const match of matches) {
    const assetUrl = match[1];
    const originalAttribute = match[0];
    const attributeName = originalAttribute.split('=')[0];

    try {
      const response = await fetch(assetUrl);

      if (!response.ok) {
        continue;
      }

      const blob = await response.blob();

      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.readAsDataURL(blob);
      });

      processedHtml = processedHtml.replace(
        originalAttribute,
        `${attributeName}="${dataUrl}"`,
      );
    } catch (error) {
      console.warn(
        `Failed to convert image ${assetUrl} to base64:`,
        error,
      );
    }
  }

  return processedHtml;
}

