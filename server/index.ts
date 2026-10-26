import express from 'express';
const app = express(); app.use(express.json({limit:'512kb'}));
app.get('/api/health', (_req,res) => res.json({ ok: true, project: 'model-olympics' }));
app.listen(5206, '127.0.0.1', () => console.log('[model-olympics] api ready on 5206'));
