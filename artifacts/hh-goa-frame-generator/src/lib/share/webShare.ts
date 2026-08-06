export function isNativeFileShareSupported(file: File): boolean {
  if (typeof navigator === "undefined" || !navigator.share || !navigator.canShare) {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function shareFileNatively(
  file: File,
  title: string,
  text: string,
): Promise<boolean> {
  if (!isNativeFileShareSupported(file)) {
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      files: [file],
    });
    return true;
  } catch (err: unknown) {
    // If user cancelled the share sheet, return false cleanly without crashing
    if (err instanceof Error && err.name === "AbortError") {
      return false;
    }
    return false;
  }
}
