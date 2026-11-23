// Types the build page shares with the server. The build runs through routes/api/build-stream.ts
// and the photo fallback through routes/api/photos.ts, both behind the per-visitor limit
// (server/limit.ts); the server functions that also reached the models are gone (public launch,
// 2026-11-23).
export type { BuildResult, BuiltSite, PhotoJob, PhotoResult } from './make-site'
