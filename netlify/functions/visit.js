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

// Anyone can POST here, so nothing arriving from a visitor is trusted.
// Paths and referers are reduced to a safe charset and capped, which also
// removes the angle brackets and quotes that would otherwise be stored and
// later rendered in the admin.
function safeText(v, max) {
  if (typeof v !== 'string') return '';
  return v.replace(/[^\w\-\/.?=&%+~:@,]/g, '').slice(0, max);
}
function safePath(v) {
  const clean = safeText(v, 200);
  if (!clean) return '/';
  return clean.charAt(0) === '/' ? clean : '/' + clean;
}
// Regions carry a coarse point so they can be plotted. Coordinates are rounded
// to half a degree — roughly 55km — so a dot marks a region, never a person.
function bumpPlace(t, key, lat, lon, cc, cap) {
  if (!key) return;
  t.regions = t.regions || {};
  const seen = t.regions[key];
  if (!seen && Object.keys(t.regions).length >= cap) return;
  const rec = seen || { n: 0 };
  rec.n += 1;
  if (cc) rec.cc = cc;
  if (typeof lat === 'number' && typeof lon === 'number' && isFinite(lat) && isFinite(lon)) {
    rec.lat = Math.round(lat * 2) / 2;
    rec.lon = Math.round(lon * 2) / 2;
  }
  t.regions[key] = rec;
}

// A flood of distinct values must not grow the record without bound.
function bump(t, bucket, name, cap) {
  if (!name) return;
  t[bucket] = t[bucket] || {};
  if (t[bucket][name] === undefined && Object.keys(t[bucket]).length >= cap) return;
  t[bucket][name] = (t[bucket][name] || 0) + 1;
}

const CORS = {
  'Access-Control-Allow-Origin': 'null',
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

// Crawlers, unfurlers and monitors are counted apart, so "how many people read
// this" is not inflated by machines. Repeated hits from a datacentre city like
// Ashburn are almost always one of these.
// Unambiguous machines: a browser never calls itself any of these.
const BOT_TOKENS = [
  'bot', 'crawl', 'spider', 'slurp', 'archiver', 'scraper', 'fetcher', 'monitor',
  'facebookexternalhit', 'redditbot', 'embedly', 'applebot', 'yandex', 'baidu', 'duckduck',
  'gptbot', 'claudebot', 'anthropic', 'perplexity', 'ccbot', 'ahrefs', 'semrush', 'mj12',
  'dotbot', 'petal', 'uptime', 'pingdom', 'lighthouse', 'headlesschrome', 'phantomjs',
  'python-requests', 'curl/', 'wget', 'go-http-client', 'node-fetch', 'axios', 'okhttp',
  'java/', 'scrapy', 'prerender', 'validator'
];

// Brand names shared by an unfurler and the app's own in-app browser. WhatsApp/2.x
// fetching a link preview is a machine; a reader who opened the link inside the
// LinkedIn or X app is a person, and their country belongs in the record. These
// count as machines ONLY when the agent is not shaped like a browser — otherwise
// every reader arriving from a shared link was filed away as a crawler and their
// country never counted, which is how the list of countries stopped growing.
const BRAND_TOKENS = [
  'whatsapp', 'telegram', 'discord', 'slack', 'twitter', 'linkedin', 'pinterest',
  'quora', 'preview'
];

// An iOS in-app browser often omits Safari and identifies itself only by its
// WebKit build — "Mobile/15E148" — so that counts as a browser marker too.
function looksLikeBrowser(ua) {
  return /Mozilla\/5\.0/i.test(ua)
    && /AppleWebKit|Gecko\//i.test(ua)
    && /(Safari|Chrome|CriOS|FxiOS|Firefox|Version|Mobile)\//i.test(ua);
}

function nameFrom(ua, hit) {
  // Name it from the agent string where possible, e.g. "GPTBot/1.2" -> "GPTBot".
  const m = ua.match(new RegExp('[A-Za-z0-9_.-]*' + hit.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '[A-Za-z0-9_.-]*', 'i'));
  return safeText(m ? m[0] : hit, 40) || hit;
}

function botLabel(ua) {
  if (!ua || ua.length < 10) return 'unknown agent';
  const low = ua.toLowerCase();
  const hard = BOT_TOKENS.find(t => low.indexOf(t) >= 0);
  if (hard) return nameFrom(ua, hard);
  if (looksLikeBrowser(ua)) return '';
  const brand = BRAND_TOKENS.find(t => low.indexOf(t) >= 0);
  return brand ? nameFrom(ua, brand) : '';
}

function parseBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

// Place names, kept to letters and ordinary punctuation. The geo header is set by
// Netlify, but a direct caller can forge it, so it is not trusted either.
function safeCode(v) {
  return typeof v === 'string' && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : '';
}

function safePlace(v) {
  if (typeof v !== 'string') return '';
  return v.replace(/[^\p{L}\p{M}0-9 .,'’\-()]/gu, '').trim().slice(0, 80);
}

// Netlify sends geography as x-nf-geo: base64 JSON with city, country, subdivision.
function parseGeo(headers) {
  const raw = headers['x-nf-geo'];
  if (raw) {
    try {
      const g = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
      return {
        city: safePlace(g.city),
        region: safePlace(g.subdivision && g.subdivision.name),
        country: safePlace(g.country && g.country.name),
        countryCode: safeCode(g.country && g.country.code),
        lat: typeof g.latitude === 'number' ? g.latitude : undefined,
        lon: typeof g.longitude === 'number' ? g.longitude : undefined
      };
    } catch (e) {}
  }
  // Older/alternative header names, in case the runtime supplies those instead.
  return {
    city: safePlace(headers['x-nf-city'] || headers['x-city']),
    region: safePlace(headers['x-nf-subdivision']),
    country: '',
    countryCode: safeCode(headers['x-nf-country'] || headers['x-country'] || headers['x-geo-country']),
    lat: undefined,
    lon: undefined
  };
}

// The site calls its own functions, so only its own origin is allowed.
function corsFor(event) {
  const host = (event.headers && event.headers.host) || '';
  return Object.assign({}, CORS, { 'Access-Control-Allow-Origin': host ? 'https://' + host : 'null' });
}

exports.handler = async (event) => {
  const CORS = corsFor(event);
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
      const bot = botLabel(ua);
      const visit = {
        time: new Date().toISOString(),
        bot: bot || undefined,
        path: safePath(body.path),
        city: geo.city,
        region: geo.region,
        country: geo.country,
        countryCode: geo.countryCode,
        referer: safeText((event.headers['referer'] || '').replace(/^https?:\/\/[^/]+/, ''), 200),
        device: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
        browser: parseBrowser(ua)
      };

      let log = await store.get("log", { type: 'json' }) || [];
      log = [visit, ...log].slice(0, LOG_SIZE);
      await store.setJSON("log", log);

      // Counts only, and they outlive the log — this is the all-time record.
      const t = await store.get("totals", { type: 'json' }) || {};
      t.since = t.since || visit.time;
      t.updated = visit.time;
      if (bot) {
        // Kept, but never mixed into the counts of people.
        t.botCount = (t.botCount || 0) + 1;
        bump(t, 'agents', bot, 100);
      } else {
        t.count = (t.count || 0) + 1;
        bump(t, 'countries', geo.country || geo.countryCode || 'Unknown', 300);
        bump(t, 'codes', geo.countryCode || 'ZZ', 300);
        bump(t, 'cities', geo.city ? (geo.city + (geo.countryCode ? ', ' + geo.countryCode : '')) : 'Unknown', 1000);
        bump(t, 'days', visit.time.slice(0, 10), 4000);
        bump(t, 'paths', visit.path, 500);
        bump(t, 'devices', visit.device, 10);
        const land = geo.country || geo.countryCode || 'Unknown';
        bumpPlace(t, land + '|' + (geo.region || ''), geo.lat, geo.lon, geo.countryCode, 1000);
      }
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
