# Share Module Documentation & Architecture

This directory contains the production-grade **Share on X** system for the HH Goa 2026 Frame & Builder ID Generator.

## Technical Constraints & Browser Security Design

### Why Images Cannot Be Auto-Attached to X Web Intent
1. **X Intent API Limitations**: `x.com/intent/post` (and `twitter.com/intent/tweet`) accepts pre-filled text parameters (`?text=...`), but does **NOT** support file attachments via URL parameters.
2. **Browser Security Sandbox**: Modern browser security specifications prohibit web applications from programmatically uploading local disk files into external third-party domains without explicit user file picker action or OAuth API authorization.

---

## 15-Point Production Architecture

1. **Synchronous Blank Popup**: Opens `about:blank` synchronously on initial user click to guarantee popup blockers do not block `window.open()`.
2. **Single Blob Reuse**: Canvas is rendered to a Blob once per share action and reused for both file download and Web Share API.
3. **Feature Detection**: Uses `navigator.canShare({ files: [file] })` to feature-detect native file sharing rather than user-agent sniffing.
4. **Memory Leak Protection**: Automatic Object URL revocation (`URL.revokeObjectURL(url)`).
5. **Filename Sanitization**: Converts names to clean ASCII hyphens (`hh-goa-builder-id-yash-suthar.png`).
6. **Framework-Agnostic Core**: `share.ts` returns a pure typed `ShareResult` state union for React UI components.

---

## Browser Compatibility Matrix

| Browser / OS | Native Web Share API | Desktop Intent | Execution Behavior |
| :--- | :---: | :---: | :--- |
| **Chrome Desktop (Win/macOS/Linux)** | ❌ | ✅ | Triggers PNG download -> opens X compose in new tab -> shows step-by-step modal |
| **Brave / Edge Desktop** | ❌ | ✅ | Triggers PNG download -> opens X compose in new tab -> shows step-by-step modal |
| **Safari macOS** | ❌ / Partial | ✅ | Triggers PNG download -> opens X compose in new tab -> shows step-by-step modal |
| **Chrome Android** | ✅ | Fallback | Opens native Android share sheet with PNG file attached to X app |
| **Safari iOS** | ✅ | Fallback | Opens native iOS share sheet with PNG file attached to X app |

---

## Folder Structure

- `constants.ts`: Centralized URLs (`APP_URL`, `HH_URL`, `HASHTAG`).
- `shareTypes.ts`: Strongly typed `ShareOptions` interface and `ShareResult` union.
- `filename.ts`: Robust ASCII filename sanitizer.
- `shareText.ts`: Pre-filled post text generators.
- `download.ts`: Canvas blob converter & download trigger with timeout safety.
- `webShare.ts`: Feature-detected native Web Share API execution.
- `providers/x.ts`: X Web Intent share provider.
- `analytics.ts`: Typed event tracking dispatcher.
- `share.ts`: Core framework-agnostic orchestrator.
