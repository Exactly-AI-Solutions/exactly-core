import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../dist/app.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Convert VercelRequest to standard Request
  const url = new URL(req.url || '/', `https://${req.headers.host}`);

  // Read body for non-GET requests
  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks).toString('utf-8');
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: body,
  });

  try {
    const response = await app.fetch(request);

    // Set status
    res.status(response.status);

    // Set headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Handle streaming response
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
