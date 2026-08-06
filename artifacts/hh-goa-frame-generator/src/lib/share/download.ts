export function canvasToBlob(
  canvas: HTMLCanvasElement,
  timeoutMs = 10000,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      canvas.toBlob((blob) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(blob);
        }
      }, "image/png");
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Safely clean up DOM element and revoke Object URL to prevent memory leaks
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}
