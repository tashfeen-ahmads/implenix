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
    // DataForSEO Google Maps (async task).
    if (req.url.startsWith('/v3/serp/google/maps/task_post')) return send(200, { status_code: 20000, status_message: 'Ok.', tasks: [{ id: 'dfs-task-1', status_code: 20100, status_message: 'Task Created.' }] });
    if (req.url.startsWith('/v3/serp/google/maps/task_get/advanced/')) {
      const items = [
        { type: 'maps_search', title: "Joe's Plumbing", category: 'Plumber', url: 'https://joesplumbing-e2e.com/', contact_url: 'https://joesplumbing-e2e.com/reach-us', phone: '+1 614-555-0101', rating: { value: 4.8, votes_count: 212 }, address_info: { city: 'Columbus', region: 'OH', zip: '43215', country_code: 'US' }, place_id: 'p1', cid: '111' },
        { type: 'maps_search', title: 'Quiet HVAC', category: 'HVAC contractor', url: 'https://quiet-e2e.com/', phone: '+1 614-555-0102', rating: { value: 4.1, votes_count: 30 }, address_info: { city: 'Columbus', region: 'OH' }, place_id: 'p2', cid: '222' },
        { type: 'maps_search', title: 'No Site Roofing', category: 'Roofer', phone: '+1 614-555-0103', rating: { value: 3.9, votes_count: 8 }, address_info: { city: 'Columbus', region: 'OH' }, place_id: 'p3', cid: '333' },
        { type: 'maps_search', title: 'Catchall Electric', category: 'Electrician', url: 'https://catchall-e2e.com', place_id: 'p4', cid: '444', contact_info: [{ type: 'mail', value: 'catchall@catchall-e2e.com', source: 'google_business' }] },
      ];
      return send(200, { status_code: 20000, status_message: 'Ok.', tasks: [{ id: 'dfs-task-1', status_code: 20000, status_message: 'Ok.', result: [{ items }] }] });
    }
    // Fake business websites for the email crawler (/site/<host><path>).
    if (req.url.startsWith('/site/')) {
      const pages = {
        'joesplumbing-e2e.com/': '<html><a href="/reach-us">Reach us</a></html>',
        'joesplumbing-e2e.com/reach-us': '<p>Email: office [at] joesplumbing-e2e [dot] com</p>',
        'quiet-e2e.com/': '<html><p>Call us today.</p><a href="/about">About</a></html>',
        'quiet-e2e.com/about': '<p>Family owned since 1998.</p>',
        'blocked-e2e.com/robots.txt': 'User-agent: *\nDisallow: /',
        'blocked-e2e.com/': '<a href="mailto:owner@blocked-e2e.com">Email</a>',
      };
      const key = req.url.slice('/site/'.length);
      if (!(key in pages)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(pages[key]);
    }
    send(404, { error: 'unknown stub path ' + req.url });
  });
}).listen(4010, () => console.log('stubs on 4010'));
