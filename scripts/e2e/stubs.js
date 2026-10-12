// Test only. Stand-ins for Amazon SES v2, OpenAI Responses and Resend. Records every
// request to calls.json for assertions.
const http = require('http'); const fs = require('fs');
const calls = [];
const save = () => fs.writeFileSync(__dirname + '/calls.json', JSON.stringify(calls, null, 1));
http.createServer((req, res) => {
  let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
    const j = (() => { try { return JSON.parse(body); } catch { return body; } })();
    calls.push({ method: req.method, path: req.url, body: j }); save();
    const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (req.url.startsWith('/v2/email/outbound-emails')) return send(200, { MessageId: 'ses-' + calls.length });
    if (req.url.startsWith('/emails')) return send(200, { id: 'resend-' + calls.length });
    if (req.url.startsWith('/v1/responses')) {
      const first = !j.previous_response_id;
      if (first) return send(200, { id: 'resp_1', object: 'response', created_at: 1, status: 'completed', model: j.model, output: [{ type: 'function_call', id: 'fc_1', call_id: 'call_1', name: 'get_open_slots', arguments: '{}', status: 'completed' }], parallel_tool_calls: false, tools: [] });
      const override = (() => { try { return fs.readFileSync(__dirname + '/agent_reply.json', 'utf8'); } catch { return null; } })();
      const text = override ?? JSON.stringify({ should_reply: true, body: 'Hi Monica,\n\nThursday afternoon works. I will send over two times shortly, or you can pick one here: https://implenix.net/contact#book\n\nTashfeen', intent: 'wants_times', summary: 'Prospect asked for a Thursday afternoon call; calendar lookup failed so times were not offered.' });
      return send(200, { id: 'resp_2', object: 'response', created_at: 2, status: 'completed', model: j.model, output: [{ type: 'message', id: 'msg_1', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text, annotations: [] }] }], parallel_tool_calls: false, tools: [] });
    }
    send(404, { error: 'unknown stub path ' + req.url });
  });
}).listen(4010, () => console.log('stubs on 4010'));
