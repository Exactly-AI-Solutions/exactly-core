import app from '../dist/app.js';

// Debug: log runtime info
console.log('runtime:', process.version, 'bun?', (globalThis as any).Bun ? 'yes' : 'no');

export default app;
