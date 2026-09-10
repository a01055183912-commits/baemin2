import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

app.get('/api/status', (req, res) => {
  res.json({ aiEnabled: Boolean(ANTHROPIC_API_KEY) });
});

app.post('/api/generate', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ai_not_configured' });
  }

  const { prompt } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'invalid_prompt' });
  }
  if (prompt.length > 6000) {
    return res.status(400).json({ error: 'prompt_too_large' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (upstream.status === 429) {
      return res.status(429).json({ error: 'rate_limited' });
    }
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      console.error('anthropic upstream error', upstream.status, detail);
      return res.status(502).json({ error: 'upstream_error' });
    }

    const data = await upstream.json();
    const text = (data.content || [])
      .map((block) => (block && block.type === 'text' ? block.text : ''))
      .join('');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: 'invalid_json' });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(502).json({ error: 'invalid_json' });
    }

    res.json(parsed);
  } catch (e) {
    console.error('generate handler failed', e);
    res.status(502).json({ error: 'upstream_error' });
  }
});

app.get('/healthz', (req, res) => res.status(200).send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`store copy workbench listening on port ${PORT}`);
});
