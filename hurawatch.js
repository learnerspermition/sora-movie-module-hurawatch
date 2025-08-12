const BASE = 'https://hurawatch.cc';
const HOME_URL = `${BASE}/home`;
const SEARCH_URL = (q) => `${BASE}/search/${encodeURIComponent(q)}`;

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SoraModule/1.0)', // Spoof UA to avoid blocking
      'Accept-Language': 'en-US,en;q=0.9'
    },
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} - ${res.status}`);
  return await res.text();
}

async function search(query) {
  // Try search page first
  const html = await fetchHTML(SEARCH_URL(query));
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const results = [];
  
  // Adjusted selector for current site
  doc.querySelectorAll('.film-poster > a').forEach(linkElem => {
    const imgElem = linkElem.querySelector('img');
    if (!imgElem) return;
    const title = imgElem.getAttribute('alt') || linkElem.getAttribute('title') || 'No Title';
    const cover = imgElem.getAttribute('data-src') || imgElem.getAttribute('src');
    const url = BASE + linkElem.getAttribute('href');
    results.push({ title, cover, url });
  });

  return results;
}

async function fetchHomepageItems() {
  const html = await fetchHTML(HOME_URL);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const results = [];

  // Example: grab movies from homepage's movie list container
  doc.querySelectorAll('.film-list .film-poster > a').forEach(linkElem => {
    const imgElem = linkElem.querySelector('img');
    if (!imgElem) return;
    const title = imgElem.getAttribute('alt') || linkElem.getAttribute('title') || 'No Title';
    const cover = imgElem.getAttribute('data-src') || imgElem.getAttribute('src');
    const url = BASE + linkElem.getAttribute('href');
    results.push({ title, cover, url });
  });

  return results;
}

async function resolve(link) {
  const html = await fetchHTML(link);
  const
hura
