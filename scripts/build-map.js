// Builds admin/world.svg — a monochrome equirectangular world map with one path
// per country, keyed by ISO alpha-2 (id="c-ZA"), so the admin can tint countries
// by visit count. Only needed when the basemap itself changes.
//
//   npm i --no-save world-atlas@2 world-countries topojson-client
//   node scripts/build-map.js
//
const topo = require('world-atlas/countries-110m.json');
const { feature } = require('topojson-client');
const countries = require('world-countries');

// numeric ISO (what the atlas uses) -> ISO alpha-2 (what x-nf-geo gives us)
const byNumeric = {};
countries.forEach(c => { byNumeric[String(parseInt(c.ccn3, 10))] = c.cca2; });

const fc = feature(topo, topo.objects.countries);

// Equirectangular, trimmed of the empty polar caps: lon -180..180, lat 83..-56
const W = 1000, LAT_TOP = 83, LAT_BOTTOM = -56;
const H = Math.round(W * (LAT_TOP - LAT_BOTTOM) / 360);
const x = lon => ((lon + 180) / 360) * W;
const y = lat => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H;
const r = n => Math.round(n * 10) / 10;

// Break the ring where it crosses the antimeridian, or the shape is drawn as a
// streak straight across the map.
// A ring that crosses the antimeridian is shifted into a continuous longitude
// range rather than split: the shape stays whole and the wrapped part clips at
// the edge. Splitting leaves a filled wedge across the map.
function ring(coords) {
  const lons = coords.map(c => c[0]);
  const crosses = Math.max(...lons) - Math.min(...lons) > 180;
  const pts = crosses ? coords.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat]) : coords;
  return 'M' + pts.map(([lon, lat]) => r(x(lon)) + ' ' + r(y(lat))).join('L') + 'Z';
}

function pathFor(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  return polys.map(poly => poly.map(ring).join('')).join('');
}

let paths = '', named = 0, unnamed = 0;
fc.features.forEach(f => {
  const code = byNumeric[String(parseInt(f.id, 10))];
  const d = pathFor(f.geometry);
  if (!d) return;
  if (code) { paths += `<path id="c-${code}" d="${d}"/>`; named++; }
  else { paths += `<path d="${d}"/>`; unnamed++; }
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`
  + `<g fill="#e8e6e3" stroke="#faf9f7" stroke-width="0.6">${paths}</g></svg>`;
require('fs').writeFileSync('/home/user/alchemy-of-things-gallery/admin/world.svg', svg);
console.log('countries with an ISO code:', named, '| without:', unnamed, '| svg KB:', Math.round(svg.length/1024));
