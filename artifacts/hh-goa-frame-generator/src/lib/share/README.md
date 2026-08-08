# Share Module Documentation & Architecture

This directory contains the production-grade, popup-free **Share on X** system for the HH Goa 2026 Frame & Builder ID Generator.

## Seamless Browser Security Architecture

### Zero-Popup, Direct Intent Execution
1. **Synchronous Intent Trigger**: Opens `https://x.com/intent/post?text=...` directly in the synchronous click context with `noopener,noreferrer`, eliminating browser popup blocker interruptions.
2. **Instant Clipboard Sync**: Copies the rich caption with `#FrameInGoa` hashtag and official links to the system clipboard on click.
3. **Parallel Image Export**: Converts canvas to high-res PNG and triggers automatic download without blocking the navigation flow.
4. **No Intrusive Modals or Redirection Loops**: Replaces intrusive 3-step modals with subtle, non-intrusive toast notifications.

---

## Folder Structure

- `constants.ts`: Centralized URLs (`APP_URL`, `HH_URL`, `HASHTAG`).
- `shareTypes.ts`: Strongly typed `ShareOptions` interface and `ShareResult` union.
- `filename.ts`: Robust ASCII filename sanitizer.
- `shareText.ts`: Pre-filled post text generators with name, role, and event hashtags.
- `download.ts`: Canvas blob converter & download trigger.
- `webShare.ts`: Feature-detected native Web Share API helper.
- `providers/x.ts`: Direct X Web Intent share provider.
- `analytics.ts`: Typed event tracking dispatcher.
- `share.ts`: Core framework-agnostic orchestrator.

