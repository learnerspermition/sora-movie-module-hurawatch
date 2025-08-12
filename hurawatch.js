const BASE = 'https://hurawatch.cc';

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SoraModule/1.0)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} - ${res.status}`);
  return await res.text();
}

async function search(query) {
  const SEARCH_URL = `${BASE}/search/${encodeURIComponent(query)}`;
  const html = await fetchHTML(SEARCH_URL);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const results = [];

  doc.querySelectorAll('.film-poster > a').forEach(link => {
    const img = link.querySelector('img');
    if (!img) return;

    const title = img.getAttribute('alt') || link.getAttribute('title') || 'No Title';
    const cover = img.getAttribute('data-src') || img.getAttribute('src') || '';
    const url = BASE + link.getAttribute('href');

    results.push({ title, cover, url });
  });

  return results;
}

async function resolve(link) {
  const html = await fetchHTML(link);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const iframe = doc.querySelector('iframe');
  if (!iframe) return [];

  const embedUrl = iframe.src.startsWith('http') ? iframe.src : BASE + iframe.src;
  const embedHtml = await fetchHTML(embedUrl);
  const embedDoc = new DOMParser().parseFromString(embedHtml, 'text/html');

  const sources = [];
  embedDoc.querySelectorAll('source').forEach(src => {
    if (src.src) {
      sources.push({
        url: src.src,
        quality: src.getAttribute('res') || 'auto',
        type: src.getAttribute('type') || 'video'
      });
    }
  });

  return sources;
}

exports.search = search;
exports.resolve = resolve;
