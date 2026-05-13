/**
 * React component exports.
 * This entry point requires React as a peer dependency.
 *
 * For framework-agnostic usage (tokens, utilities, style functions),
 * use the "core" entry point instead:
 *   import { buttonStyles, colors } from "@jyi/design-system/core";
 */
export * from "./components";

// React hooks (require React; not exported from /core).
export { useDir, type Dir } from "./utils/useDir";
