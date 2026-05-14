const { getStore } = require("@netlify/blobs");

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function parseBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  let store;
  try { store = getStore("visits"); }
  catch (e) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const log = await store.get("log", { type: 'json' }) || [];
      return { statusCode: 200, headers: CORS, body: JSON.stringify(log) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const ua = event.headers['user-agent'] || '';
      const ip = (event.headers['x-nf-client-connection-ip'] ||
                  (event.headers['x-forwarded-for'] || '').split(',')[0]).trim() || 'unknown';

      const visit = {
        time: new Date().toISOString(),
        path: body.path || '/',
        country: event.headers['x-country'] || '',
        city: event.headers['x-city'] || '',
        ip: ip.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.xxx'),
        referer: (event.headers['referer'] || '').replace(/^https?:\/\/[^/]+/, '') || '',
        device: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
        browser: parseBrowser(ua)
      };

      let log = await store.get("log", { type: 'json' }) || [];
      log = [visit, ...log].slice(0, 50);
      await store.setJSON("log", log);

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: '{}' };
  } catch (e) {
    console.error('Visit error:', e);
    return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };
  }
};
