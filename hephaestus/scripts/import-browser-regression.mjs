// Compatibility entry point for the maintained isolated browser regressions.
// Requires the development server and the installed chrome-devtools CLI.
await import('./audit-browser-regression.mjs')
await import('./actions-browser-regression.mjs')
