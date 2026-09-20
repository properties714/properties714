import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const {
  PORT = 8787,
  CLOUD_MEMORY_TOKEN,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

for (const [name, value] of Object.entries({ CLOUD_MEMORY_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
  if (!value) throw new Error(`${name} env var is required`);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function buildServer() {
  const server = new McpServer({ name: 'cloud-memory', version: '0.1.0' });

  server.tool(
    'remember',
    'Store or update a piece of memory under a key, so any connected assistant can recall it later.',
    {
      key: z.string().min(1).describe('Short stable identifier, e.g. "user.preferred_name"'),
      value: z.string().min(1).describe('The information to remember'),
      tags: z.array(z.string()).optional().describe('Optional labels for filtering later'),
    },
    async ({ key, value, tags }) => {
      const { error } = await supabase
        .from('cloud_memory')
        .upsert({ key, value, tags: tags ?? [], updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw new Error(error.message);
      return { content: [{ type: 'text', text: `Remembered "${key}".` }] };
    },
  );

  server.tool(
    'recall',
    'Search stored memories by text match on the key/value, or by tag.',
    {
      query: z.string().optional().describe('Text to search for in the key or value'),
      tag: z.string().optional().describe('Only return memories with this tag'),
      limit: z.number().int().positive().max(100).default(20),
    },
    async ({ query, tag, limit }) => {
      let q = supabase
        .from('cloud_memory')
        .select('key, value, tags, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);
      if (query) q = q.or(`key.ilike.%${query}%,value.ilike.%${query}%`);
      if (tag) q = q.contains('tags', [tag]);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'list_memories',
    'List the most recently updated memories.',
    { limit: z.number().int().positive().max(200).default(50) },
    async ({ limit }) => {
      const { data, error } = await supabase
        .from('cloud_memory')
        .select('key, tags, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'forget',
    'Delete a stored memory by key.',
    { key: z.string().min(1) },
    async ({ key }) => {
      const { error } = await supabase.from('cloud_memory').delete().eq('key', key);
      if (error) throw new Error(error.message);
      return { content: [{ type: 'text', text: `Forgot "${key}".` }] };
    },
  );

  return server;
}

const app = express();
app.use(express.json());

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.use((req, res, next) => {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token !== CLOUD_MEMORY_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

// Stateless mode: a fresh McpServer + transport per request. Simpler than
// tracking session IDs, and fine here since every tool call round-trips to
// Supabase anyway rather than depending on in-memory server state.
app.post('/mcp', async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: 'internal_error' });
  }
});

app.listen(PORT, () => {
  console.log(`cloud-memory MCP server listening on :${PORT}`);
});
