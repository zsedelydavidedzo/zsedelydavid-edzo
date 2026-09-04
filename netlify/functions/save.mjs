/* =============================================================================
   Netlify Function — az admin panel mentése GitHub-ra
   POST /.netlify/functions/save
   Body: { password, message, files: [{ path, content, encoding }] }
          encoding: "utf-8" (szöveg) vagy "base64" (kép)

   Szükséges Netlify környezeti változók:
     ADMIN_PASSWORD  – az admin panel jelszava
     GITHUB_TOKEN    – fine-grained PAT, Contents: Read and write
     GITHUB_REPO     – pl. "zsedelydavidedzo/zsedelydavid-edzo"
     GITHUB_BRANCH   – opcionális, alapértelmezés: "main"
   ========================================================================== */

const API = 'https://api.github.com';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Időzítés-független jelszó-összehasonlítás */
function safeEqual(a, b) {
  const A = new TextEncoder().encode(String(a));
  const B = new TextEncoder().encode(String(b));
  let diff = A.length ^ B.length;
  const n = Math.max(A.length, B.length);
  for (let i = 0; i < n; i++) diff |= (A[i] ?? 0) ^ (B[i] ?? 0);
  return diff === 0;
}

async function gh(token, path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      'user-agent': 'zsedelydavid-admin',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const msg = (data && (data.message || data.raw)) || res.statusText;
    throw new Error(`GitHub ${res.status}: ${msg}`);
  }
  return data;
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return json({ error: 'Csak POST kérés engedélyezett.' }, 405);

  const PASS   = process.env.ADMIN_PASSWORD;
  const TOKEN  = process.env.GITHUB_TOKEN;
  const REPO   = process.env.GITHUB_REPO;
  const BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!PASS || !TOKEN || !REPO) {
    return json({ error: 'A szerver nincs beállítva. Hiányzó környezeti változó: ADMIN_PASSWORD / GITHUB_TOKEN / GITHUB_REPO.' }, 500);
  }

  let body;
  try { body = await req.json(); }
  catch { return json({ error: 'Hibás kérés (nem érvényes JSON).' }, 400); }

  if (!safeEqual(body.password, PASS)) {
    await new Promise(r => setTimeout(r, 1200));   // brute-force lassítás
    return json({ error: 'Hibás jelszó.' }, 401);
  }

  // ---- betöltés: a repóban lévő NYERS forrás (nem az élő, feldolgozott oldal) ----
  if (body.action === 'load') {
    const path = typeof body.path === 'string' ? body.path : 'index.html';
    if (!/^(index|adatkezeles|aszf|koszonjuk|404)\.html$/.test(path)) {
      return json({ error: `Nem engedélyezett útvonal: ${path}` }, 400);
    }
    try {
      const f = await gh(TOKEN, `/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
      const content = Buffer.from(f.content, 'base64').toString('utf-8');
      return json({ ok: true, path, content, sha: f.sha });
    } catch (err) {
      return json({ error: String(err.message || err) }, 502);
    }
  }

  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length) return json({ error: 'Nincs menteni való fájl.' }, 400);

  // Csak a megengedett útvonalakra írhat
  const ALLOWED = /^(index\.html|adatkezeles\.html|aszf\.html|koszonjuk\.html|404\.html|img\/[A-Za-z0-9._-]+)$/;
  for (const f of files) {
    if (typeof f.path !== 'string' || !ALLOWED.test(f.path)) {
      return json({ error: `Nem engedélyezett útvonal: ${f.path}` }, 400);
    }
    if (typeof f.content !== 'string') {
      return json({ error: `Hiányzó tartalom: ${f.path}` }, 400);
    }
  }

  try {
    // 1. az ág jelenlegi feje
    const ref = await gh(TOKEN, `/repos/${REPO}/git/ref/heads/${BRANCH}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(TOKEN, `/repos/${REPO}/git/commits/${headSha}`);

    // 2. blobok
    const tree = [];
    for (const f of files) {
      const isB64 = f.encoding === 'base64';
      const blob = await gh(TOKEN, `/repos/${REPO}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: f.content, encoding: isB64 ? 'base64' : 'utf-8' }),
      });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // 3. fa
    const newTree = await gh(TOKEN, `/repos/${REPO}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
    });

    // 4. commit
    const msg = (typeof body.message === 'string' && body.message.trim())
      ? body.message.trim().slice(0, 200)
      : 'Tartalom frissítése az admin panelről';
    const commit = await gh(TOKEN, `/repos/${REPO}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `${msg}\n\n[admin panel]`,
        tree: newTree.sha,
        parents: [headSha],
      }),
    });

    // 5. ág mozgatása
    await gh(TOKEN, `/repos/${REPO}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    return json({
      ok: true,
      commit: commit.sha.slice(0, 7),
      files: files.map(f => f.path),
      note: 'A Netlify 1–2 percen belül újraépíti az oldalt.',
    });
  } catch (err) {
    return json({ error: String(err.message || err) }, 502);
  }
};

export const config = { path: '/api/save' };
