const { getStore, connectLambda } = require("@netlify/blobs");

// These handlers use the legacy `exports.handler` signature. With that signature
// Netlify does not configure Blobs automatically — it passes the context on
// event.blobs, and connectLambda() is what hands it to the client. Without this
// call getStore() throws, which is why storage looked unavailable.
function connectBlobs(event) {
  try {
    if (typeof connectLambda === 'function' && event && event.blobs) {
      connectLambda(event);
      return true;
    }
  } catch (e) {}
  return false;
}

const LOG_SIZE = 100;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Blobs normally configures itself from the runtime. If that fails, fall back to
// explicit credentials so the site owner can fix it from the Netlify UI.
function openStore(name) {
  try { return getStore(name); } catch (e) {}
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN;
  if (siteID && token) {
    try { return getStore({ name, siteID, token }); } catch (e) {}
  }
  return null;
}

// Which half of the manual fallback is present, so the admin can name the gap.
function storageGap(event, connected) {
  return {
    error: 'storage-unavailable',
    lambdaContext: connected,
    contextOnEvent: !!(event && event.blobs),
    hasSiteId: !!(process.env.NETLIFY_SITE_ID || process.env.SITE_ID),
    hasToken: !!(process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN)
  };
}

function parseBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

// Netlify sends geography as x-nf-geo: base64 JSON with city, country, subdivision.
function parseGeo(headers) {
  const raw = headers['x-nf-geo'];
  if (raw) {
    try {
      const g = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
      return {
        city: g.city || '',
        region: (g.subdivision && g.subdivision.name) || '',
        country: (g.country && g.country.name) || '',
        countryCode: (g.country && g.country.code) || ''
      };
    } catch (e) {}
  }
  // Older/alternative header names, in case the runtime supplies those instead.
  const code = headers['x-nf-country'] || headers['x-country'] || headers['x-geo-country'] || '';
  return {
    city: headers['x-nf-city'] || headers['x-city'] || '',
    region: headers['x-nf-subdivision'] || '',
    country: '',
    countryCode: code
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const connected = connectBlobs(event);
  const store = openStore("visits");
  if (!store) {
    // Say so rather than returning an empty list, which reads as "no visitors".
    return {
      statusCode: 200, headers: CORS,
      body: JSON.stringify(storageGap(event, connected))
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const log = await store.get("log", { type: 'json' }) || [];
      const totals = await store.get("totals", { type: 'json' }) || { count: 0, countries: {} };
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ log, totals, logSize: LOG_SIZE }) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const ua = event.headers['user-agent'] || '';
      const geo = parseGeo(event.headers);

      // No address of any kind is kept: how many, from where, and what was read.
      const visit = {
        time: new Date().toISOString(),
        path: body.path || '/',
        city: geo.city,
        region: geo.region,
        country: geo.country,
        countryCode: geo.countryCode,
        referer: (event.headers['referer'] || '').replace(/^https?:\/\/[^/]+/, '') || '',
        device: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
        browser: parseBrowser(ua)
      };

      let log = await store.get("log", { type: 'json' }) || [];
      log = [visit, ...log].slice(0, LOG_SIZE);
      await store.setJSON("log", log);

      // Counts only, and they outlive the log — this is the all-time record.
      const t = await store.get("totals", { type: 'json' }) || {};
      const bump = (key, name) => {
        t[key] = t[key] || {};
        if (name) t[key][name] = (t[key][name] || 0) + 1;
      };
      t.count = (t.count || 0) + 1;
      t.since = t.since || visit.time;
      t.updated = visit.time;
      bump('countries', geo.country || geo.countryCode || 'Unknown');
      bump('codes', geo.countryCode || 'ZZ');
      bump('cities', geo.city ? (geo.city + (geo.countryCode ? ', ' + geo.countryCode : '')) : 'Unknown');
      bump('days', visit.time.slice(0, 10));
      bump('paths', visit.path);
      bump('devices', visit.device);
      await store.setJSON("totals", t);

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: '{}' };
  } catch (e) {
    console.error('Visit error:', e);
    return {
      statusCode: 200, headers: CORS,
      body: JSON.stringify({ error: 'storage-failed', detail: String(e && e.message || e) })
    };
  }
};
