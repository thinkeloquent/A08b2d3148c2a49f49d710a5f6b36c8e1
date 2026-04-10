/**
 * Generates a plain-markdown version of the API docs (no UI).
 * @param {string} apiPrefix - e.g. "/~/api/categories"
 */
export function buildApiDocsMd(apiPrefix) {
  const p = apiPrefix;
  return `# Categories API

Interactive documentation for the Categories service endpoints.

## Endpoints

### Export All

\`GET ${p}/export\`

Retrieve all categories, category types, and target applications as JSON.

### List Categories

\`GET ${p}/\`

List categories with optional filters. Both filters are combinable.

| Parameter | Required | Description |
|-----------|----------|-------------|
| category_type_id | No | Filter by category type UUID |
| category_type_name | No | Filter by category type name (case-insensitive) |
| target_app_id | No | Filter by target app UUID |
| target_app_name | No | Filter by target app name (case-insensitive) |

Name and ID filters are alternatives — if both are provided for the same dimension, the ID takes precedence.

**Examples:**
- \`GET ${p}/?category_type_name=some-type\`
- \`GET ${p}/?target_app_name=my-app\`
- \`GET ${p}/?category_type_name=some-type&target_app_name=my-app\`

### Search Categories

\`GET ${p}/search\`

Fuzzy search across name and description (case-insensitive ILIKE).

| Parameter | Required | Description |
|-----------|----------|-------------|
| q | Yes | Search term |

### Get Category

\`GET ${p}/:id\`

Retrieve a single category by its UUID.

| Parameter | Required | Description |
|-----------|----------|-------------|
| id | Yes | Category UUID |

## Lookup Tables

### List Category Types

\`GET ${p}/category-types\`

Retrieve all category type lookup values.

### List Target Apps

\`GET ${p}/target-apps\`

Retrieve all target application lookup values.

`;
}

/**
 * Generates the self-contained HTML for the interactive API docs page.
 * All JS uses delegated event listeners (CSP-compliant, no inline handlers).
 * @param {string} apiPrefix - e.g. "/~/api/categories"
 * @param {{ nonce?: string }} [options]
 */
export function buildApiDocsHtml(apiPrefix, options = {}) {
  const p = apiPrefix;
  const nonceAttr = options.nonce ? ` nonce="${options.nonce}"` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Categories API</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0; padding: 2rem 1rem; background: #f3f4f6; color: #1a1a2e;
  }
  .container { max-width: 960px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
  .subtitle { color: #6b7280; margin: 0 0 2rem; font-size: 0.9rem; }

  /* --- Card --- */
  .card {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
    padding: 1.25rem 1.5rem; margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .card-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem; }
  .card-title { font-size: 1.05rem; font-weight: 600; }
  .card-desc { color: #6b7280; font-size: 0.85rem; margin-bottom: 0.75rem; }

  /* --- Method badge --- */
  .badge {
    display: inline-block; padding: 0.15rem 0.55rem; border-radius: 4px;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase;
  }
  .badge-get    { background: #d1fae5; color: #065f46; }

  /* --- URL row --- */
  .url-row {
    display: flex; align-items: center; gap: 0.5rem; background: #f9fafb;
    border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.45rem 0.75rem;
    margin-bottom: 0.75rem; font-size: 0.85rem;
  }
  .url-row .link-icon { color: #9ca3af; flex-shrink: 0; }
  .url-row .url-text { flex: 1; color: #374151; word-break: break-all; }
  .url-row .copy-btn {
    background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0.2rem;
    border-radius: 4px; display: flex; align-items: center;
  }
  .url-row .copy-btn:hover { color: #6b7280; background: #e5e7eb; }

  /* --- Params --- */
  .params { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; }
  .param-group { display: flex; flex-direction: column; gap: 0.25rem; min-width: 180px; }
  .param-group label {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; color: #374151;
  }
  .param-group label .req { color: #ef4444; }
  .param-group input, .param-group select {
    border: 1px solid #d1d5db; border-radius: 8px; padding: 0.45rem 0.65rem;
    font-size: 0.85rem; color: #1f2937; background: #fff; outline: none;
  }
  .param-group input:focus, .param-group select:focus {
    border-color: #818cf8; box-shadow: 0 0 0 2px rgba(129,140,248,0.2);
  }
  .param-group input::placeholder { color: #9ca3af; }

  /* --- Try It button --- */
  .try-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #6366f1; color: #fff; border: none; border-radius: 8px;
    padding: 0.5rem 1.1rem; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .try-btn:hover { background: #4f46e5; }
  .try-btn svg { width: 14px; height: 14px; }

  /* --- Response --- */
  .response {
    margin-top: 0.75rem; border-radius: 8px; overflow: hidden;
    border: 1px solid #e5e7eb; display: none;
  }
  .response.visible { display: block; }
  .response-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.4rem 0.75rem; background: #f9fafb; font-size: 0.75rem; font-weight: 600;
  }
  .response-status { font-weight: 700; }
  .response-status.ok { color: #059669; }
  .response-status.err { color: #dc2626; }
  .response-body {
    padding: 0.75rem; background: #1e1e2e; color: #a6e3a1;
    font-family: "SF Mono", "Fira Code", Consolas, monospace;
    font-size: 0.8rem; white-space: pre-wrap; word-break: break-all;
    max-height: 320px; overflow-y: auto;
  }

  /* --- Section header --- */
  .section-title {
    font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #6b7280; margin: 2rem 0 0.75rem;
  }

</style>
</head>
<body>
<div class="container">
  <h1>Categories API</h1>
  <p class="subtitle">Interactive documentation for the Categories service endpoints.</p>

  <!-- ===== Export All ===== -->
  <div class="card" id="card-export">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="card-title">Export All</span>
    </div>
    <p class="card-desc">Retrieve all categories, category types, and target applications as JSON.</p>
    <div class="url-row">
      <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span class="url-text">${p}/export</span>
      <button class="copy-btn" data-action="copy-url" title="Copy URL">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
    <button class="try-btn" data-action="try-get" data-card="card-export" data-url="${p}/export">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Try It
    </button>
    <div class="response" id="resp-card-export"></div>
  </div>

  <!-- ===== List Categories ===== -->
  <div class="card" id="card-list">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="card-title">List Categories</span>
    </div>
    <p class="card-desc">List categories with optional filters. Both filters are combinable.</p>
    <div class="url-row">
      <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span class="url-text">${p}/</span>
      <button class="copy-btn" data-action="copy-url" title="Copy URL">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
    <div class="params">
      <div class="param-group">
        <label>CATEGORY_TYPE_ID</label>
        <select id="filter-type">
          <option value="">All types</option>
        </select>
      </div>
      <div class="param-group">
        <label>CATEGORY_TYPE_NAME</label>
        <input type="text" id="filter-type-name" placeholder="Type name (case-insensitive)...">
      </div>
      <div class="param-group">
        <label>TARGET_APP_ID</label>
        <select id="filter-app">
          <option value="">All apps</option>
        </select>
      </div>
      <div class="param-group">
        <label>TARGET_APP_NAME</label>
        <input type="text" id="filter-app-name" placeholder="App name (case-insensitive)...">
      </div>
    </div>
    <button class="try-btn" data-action="try-list-categories">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Try It
    </button>
    <div class="response" id="resp-card-list"></div>
  </div>

  <!-- ===== Search Categories ===== -->
  <div class="card" id="card-search">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="card-title">Search Categories</span>
    </div>
    <p class="card-desc">Fuzzy search across name and description (case-insensitive ILIKE).</p>
    <div class="url-row">
      <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span class="url-text">${p}/search</span>
      <button class="copy-btn" data-action="copy-url" title="Copy URL">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
    <div class="params">
      <div class="param-group">
        <label>Q <span class="req">*</span></label>
        <input type="text" id="search-q" placeholder="Search term...">
      </div>
    </div>
    <button class="try-btn" data-action="try-search">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Try It
    </button>
    <div class="response" id="resp-card-search"></div>
  </div>

  <!-- ===== Get Category by ID ===== -->
  <div class="card" id="card-get-one">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="card-title">Get Category</span>
    </div>
    <p class="card-desc">Retrieve a single category by its UUID.</p>
    <div class="url-row">
      <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span class="url-text">${p}/:id</span>
      <button class="copy-btn" data-action="copy-url" title="Copy URL">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
    <div class="params">
      <div class="param-group">
        <label>ID <span class="req">*</span></label>
        <input type="text" id="get-one-id" placeholder="UUID...">
      </div>
    </div>
    <button class="try-btn" data-action="try-get-one">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Try It
    </button>
    <div class="response" id="resp-card-get-one"></div>
  </div>

  <div class="section-title">Lookup Tables</div>

  <!-- ===== List Category Types ===== -->
  <div class="card" id="card-types">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="card-title">List Category Types</span>
    </div>
    <p class="card-desc">Retrieve all category type lookup values.</p>
    <div class="url-row">
      <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span class="url-text">${p}/category-types</span>
      <button class="copy-btn" data-action="copy-url" title="Copy URL">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
    <button class="try-btn" data-action="try-get" data-card="card-types" data-url="${p}/category-types">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Try It
    </button>
    <div class="response" id="resp-card-types"></div>
  </div>

  <!-- ===== List Target Apps ===== -->
  <div class="card" id="card-apps">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="card-title">List Target Apps</span>
    </div>
    <p class="card-desc">Retrieve all target application lookup values.</p>
    <div class="url-row">
      <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span class="url-text">${p}/target-apps</span>
      <button class="copy-btn" data-action="copy-url" title="Copy URL">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
    <button class="try-btn" data-action="try-get" data-card="card-apps" data-url="${p}/target-apps">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Try It
    </button>
    <div class="response" id="resp-card-apps"></div>
  </div>

</div>

<script${nonceAttr}>
(function() {
  var API = '${p}';

  function el(id) { return document.getElementById(id); }

  function copyUrl(btn) {
    var text = btn.closest('.url-row').querySelector('.url-text').textContent;
    navigator.clipboard.writeText(location.origin + text);
  }

  function updateCardUrl(cardId, url) {
    var card = el(cardId);
    if (!card) return;
    var urlText = card.querySelector('.url-text');
    if (urlText) urlText.textContent = url;
  }

  function showResponse(cardId, status, body) {
    var resp = el('resp-' + cardId);
    var ok = status >= 200 && status < 300;
    resp.innerHTML =
      '<div class="response-header"><span>Response</span><span class="response-status ' + (ok ? 'ok' : 'err') + '">' + status + '</span></div>' +
      '<pre class="response-body">' + escHtml(typeof body === 'string' ? body : JSON.stringify(body, null, 2)) + '</pre>';
    resp.classList.add('visible');
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  async function doFetch(url, opts) {
    var res = await fetch(url, opts);
    var body;
    try { body = await res.json(); } catch(e) { body = await res.text(); }
    return { status: res.status, body: body };
  }

  async function tryGet(cardId, url) {
    updateCardUrl(cardId, url);
    var r = await doFetch(url);
    showResponse(cardId, r.status, r.body);
  }

  async function tryListCategories() {
    var typeId = el('filter-type').value;
    var typeName = el('filter-type-name').value.trim();
    var appId = el('filter-app').value;
    var appName = el('filter-app-name').value.trim();
    var params = new URLSearchParams();
    if (typeId) params.set('category_type_id', typeId);
    else if (typeName) params.set('category_type_name', typeName);
    if (appId) params.set('target_app_id', appId);
    else if (appName) params.set('target_app_name', appName);
    var qs = params.toString();
    var url = API + '/' + (qs ? '?' + qs : '');
    updateCardUrl('card-list', url);
    var r = await doFetch(url);
    showResponse('card-list', r.status, r.body);
  }

  async function trySearch() {
    var q = el('search-q').value.trim();
    if (!q) return;
    var url = API + '/search?q=' + encodeURIComponent(q);
    updateCardUrl('card-search', url);
    var r = await doFetch(url);
    showResponse('card-search', r.status, r.body);
  }

  async function tryGetOne() {
    var id = el('get-one-id').value.trim();
    if (!id) return;
    var url = API + '/' + encodeURIComponent(id);
    updateCardUrl('card-get-one', url);
    var r = await doFetch(url);
    showResponse('card-get-one', r.status, r.body);
  }

  // --- Delegated event listener (no inline handlers) ---
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === 'copy-url') {
      copyUrl(btn);
    } else if (action === 'try-get') {
      tryGet(btn.dataset.card, btn.dataset.url);
    } else if (action === 'try-list-categories') {
      tryListCategories();
    } else if (action === 'try-search') {
      trySearch();
    } else if (action === 'try-get-one') {
      tryGetOne();
    }
  });

  // Populate filter dropdowns on load
  (async function loadLookups() {
    try {
      var results = await Promise.all([
        fetch(API + '/category-types').then(function(r) { return r.json(); }),
        fetch(API + '/target-apps').then(function(r) { return r.json(); }),
      ]);
      var typesRes = results[0];
      var appsRes = results[1];
      var typeSel = el('filter-type');
      for (var i = 0; i < (typesRes.category_types || []).length; i++) {
        var t = typesRes.category_types[i];
        var o = document.createElement('option');
        o.value = t.id; o.textContent = t.name;
        typeSel.appendChild(o);
      }
      var appSel = el('filter-app');
      for (var j = 0; j < (appsRes.target_apps || []).length; j++) {
        var a = appsRes.target_apps[j];
        var o2 = document.createElement('option');
        o2.value = a.id; o2.textContent = a.name;
        appSel.appendChild(o2);
      }
    } catch(e) { /* lookups not available */ }
  })();
})();
</script>
</body>
</html>`;
}
