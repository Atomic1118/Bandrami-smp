/* =========================================================
   BS COMMUNITY — dynamic content loader
   Pure browser JavaScript. No backend, no database.

   GitHub Pages note:
   Browsers cannot list a folder on a static host by themselves.
   On GitHub Pages this script uses GitHub's public Contents API
   to discover new .md files / gallery images automatically.
   That means adding a file is enough; HTML does not change.
   ========================================================= */

const CONFIG = {
  siteName: "Bandrami SMP",
  discordUrl: "https://discord.gg/Y4QWhVrg5Z",
  maxNoticesOnHome: 3,
  githubApiCacheMinutes: 10,
  content: {
    serverInfo: "content/server/server-info.md",
    rules: "content/server/rules.md",
    join: "content/join/how-to-join.md",
    staff: "content/staff/",
    plugins: "content/plugins/",
    mods: "content/mods/",
    notices: "content/notices/",
    gallery: "assets/gallery/"
  }
};

const state = {
  modalOpen: false,
  lastFocused: null
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  applySiteName();
  setupNavigation();
  setupMobileNav();
  setupModal();
  setupRevealObserver();

  await Promise.allSettled([
    loadServerInfo(),
    loadStaff(),
    loadPlugins(),
    loadMods(),
    loadNotices(),
    loadGallery(),
    loadJoin()
  ]);

  const route = getRoute();
  setActiveRoute(route);
}

function applySiteName() {
  document.title = `${CONFIG.siteName} — Minecraft`;
  document.querySelectorAll("#siteName, #mobileSiteName").forEach(el => {
    el.textContent = CONFIG.siteName;
  });
  const discord = document.getElementById("discordButton");
  if (discord) discord.href = CONFIG.discordUrl;
}

function getRoute() {
  const hash = window.location.hash.replace("#", "").trim().toLowerCase();
  const allowed = ["home","info","staff","plugins","resource-pack","mods","notices","gallery","join"];
  return allowed.includes(hash) ? hash : "home";
}

function setActiveRoute(route) {
  document.querySelectorAll(".nav-item").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${route}`);
  });
  document.querySelectorAll(".mobile-nav a").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${route}`);
  });
}

function setupNavigation() {
  window.addEventListener("hashchange", () => {
    const route = getRoute();
    setActiveRoute(route);
    closeMobileNav();
    document.getElementById(route)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setupMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("mobileNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const willOpen = nav.hidden;
    nav.hidden = !willOpen;
    toggle.setAttribute("aria-expanded", String(willOpen));
  });
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", closeMobileNav);
  });
}

function closeMobileNav() {
  const nav = document.getElementById("mobileNav");
  const toggle = document.querySelector(".menu-toggle");
  if (!nav || !toggle) return;
  nav.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
}

function setupRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

function setupModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && state.modalOpen) closeModal();
    if (event.key === "Tab" && state.modalOpen) trapFocus(event);
  });
}

function openModal({ title, meta = "", body = "", media = "" }) {
  const modal = document.getElementById("modal");
  const titleEl = document.getElementById("modalTitle");
  const metaEl = document.getElementById("modalMeta");
  const bodyEl = document.getElementById("modalBody");
  const mediaEl = document.getElementById("modalMedia");
  if (!modal || !titleEl || !bodyEl || !mediaEl) return;

  state.lastFocused = document.activeElement;
  titleEl.textContent = title || "Details";
  metaEl.textContent = meta;
  bodyEl.innerHTML = body;
  mediaEl.innerHTML = media;
  modal.hidden = false;
  state.modalOpen = true;
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close")?.focus();
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal.hidden = true;
  state.modalOpen = false;
  document.body.style.overflow = "";
  state.lastFocused?.focus?.();
}

function trapFocus(event) {
  const modal = document.getElementById("modal");
  const focusables = [...modal.querySelectorAll("button, a, input, textarea, select, [tabindex]:not([tabindex='-1'])")]
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function makeEmpty(containerId, title, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>`;
}

function makeError(containerId, title, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="empty-state error-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>`;
}

async function loadServerInfo() {
  try {
    const [info, rules] = await Promise.all([
      fetchText(CONFIG.content.serverInfo),
      fetchText(CONFIG.content.rules)
    ]);

    const grid = document.getElementById("serverInfoGrid");
    if (!grid) return;

    const infoParsed = parseMarkdownFile(info);
    const rulesParsed = parseMarkdownFile(rules);

    grid.innerHTML = `
      <article class="info-panel large reveal in-view">
        <h3>${escapeHtml(infoParsed.frontmatter.title || "SERVER INFO")}</h3>
        <div class="rich-copy">${renderMarkdown(infoParsed.body, CONFIG.content.serverInfo)}</div>
      </article>
      <article class="info-panel reveal in-view">
        <h3>${escapeHtml(rulesParsed.frontmatter.title || "RULES")}</h3>
        <div class="rich-copy">${renderMarkdown(rulesParsed.body, CONFIG.content.rules)}</div>
      </article>`;

    const preview = document.getElementById("homeInfoPreview");
    if (preview) {
      const plain = stripMarkdown(infoParsed.body).trim();
      preview.innerHTML = `<p>${escapeHtml(truncate(plain, 240))}</p>`;
      preview.style.color = "var(--muted)";
      preview.style.fontSize = "14px";
    }
  } catch (error) {
    makeError("serverInfoGrid", "INFO UNAVAILABLE", "Bandrami SMP");
    const preview = document.getElementById("homeInfoPreview");
    if (preview) preview.innerHTML = `<p>Server information has not been added yet.</p>`;
  }
}

async function loadJoin() {
  try {
    const raw = await fetchText(CONFIG.content.join);
    const parsed = parseMarkdownFile(raw);
    const container = document.getElementById("joinContent");
    if (container) container.innerHTML = renderMarkdown(parsed.body, CONFIG.content.join);

    const fmDiscord = parsed.frontmatter.discord;
    if (fmDiscord) document.getElementById("discordButton").href = fmDiscord;
  } catch (error) {
    const container = document.getElementById("joinContent");
    if (container) {
      container.innerHTML = `
        <p><strong>See the Discord for the current server status and joining information.</strong></p>
        <p>Please contact/ask the server owner if you need access or have any questions.</p>`;
    }
  }
}

async function loadStaff() {
  await loadMarkdownDirectory({
    directory: CONFIG.content.staff,
    containerId: "staffGrid",
    emptyTitle: "STAFF",
    emptyMessage: "Bandrami SMP",
    createCard: buildStaffCard,
    sortFn: frontmatterOrderSort
  });
}

async function loadPlugins() {
  await loadMarkdownDirectory({
    directory: CONFIG.content.plugins,
    containerId: "pluginsGrid",
    emptyTitle: "PLUGINS",
    emptyMessage: "Bandrami SMP",
    createCard: buildPluginCard,
    sortFn: frontmatterNameSort
  });
}

async function loadMods() {
  await loadModpackIntro();
}

async function loadModpackIntro() {
  const container = document.getElementById("modpackBlock");
  if (!container) return;
  try {
    const raw = await fetchText("content/server/modpack.md");
    const parsed = parseMarkdownFile(raw);
    container.innerHTML = `
      <h3>${escapeHtml(parsed.frontmatter.title || "MODPACK")}</h3>
      <div class="rich-copy">${renderMarkdown(parsed.body, "content/server/modpack.md")}</div>`;
  } catch {
    container.innerHTML = `
      <h3>MODPACK</h3>
      <div class="rich-copy"><p>Bandrami SMP</p></div>`;
  }
}

async function loadNotices() {
  const containerId = "noticesGrid";
  try {
    const files = await discoverFiles(CONFIG.content.notices, ".md");
    if (!files.length) {
      makeEmpty(containerId, "NO NOTICES YET", "Bandrami SMP");
      return;
    }

    const items = await Promise.all(files.map(async file => {
      try {
        const raw = await fetchText(file.path);
        const parsed = parseMarkdownFile(raw);
        return { file, ...parsed };
      } catch {
        return null;
      }
    }));

    const notices = items.filter(Boolean).sort((a,b) => {
      const da = parseDateValue(a.frontmatter.date);
      const db = parseDateValue(b.frontmatter.date);
      return db - da;
    });

    containerHtml(containerId, notices.map(buildNoticeCard).join(""));
  } catch (error) {
    makeError(containerId, "NOTICES UNAVAILABLE", getDiscoveryErrorMessage(error));
  }
}

async function loadGallery() {
  const containerId = "galleryGrid";
  try {
    const files = await discoverFiles(CONFIG.content.gallery, null, ["jpg","jpeg","png","webp","gif"]);
    if (!files.length) {
      const container = document.getElementById(containerId);
      if (container) container.classList.add("gallery-empty");
      makeEmpty(containerId, "GALLERY IS EMPTY", "Bandrami SMP");
      return;
    }

    const container = document.getElementById(containerId);
    if (container) container.classList.remove("gallery-empty");

    const items = await Promise.all(files.map(async file => {
      const sidecar = file.path.replace(/\.[^/.]+$/, ".md");
      let meta = { frontmatter: {}, body: "" };
      try {
        meta = parseMarkdownFile(await fetchText(sidecar));
      } catch {}
      return { file, ...meta };
    }));

    containerHtml(containerId, items.map(buildGalleryItem).join(""));
  } catch (error) {
    makeError(containerId, "GALLERY UNAVAILABLE", getDiscoveryErrorMessage(error));
  }
}

async function loadMarkdownDirectory({ directory, containerId, emptyTitle, emptyMessage, createCard, sortFn }) {
  try {
    const files = await discoverFiles(directory, ".md");
    if (!files.length) {
      makeEmpty(containerId, emptyTitle, emptyMessage);
      return;
    }

    const items = await Promise.all(files.map(async file => {
      try {
        const raw = await fetchText(file.path);
        return { file, ...parseMarkdownFile(raw) };
      } catch {
        return null;
      }
    }));

    const valid = items.filter(Boolean);
    valid.sort(sortFn);
    containerHtml(containerId, valid.map(createCard).join(""));
    bindGeneratedCards();
  } catch (error) {
    makeError(containerId, "CONTENT UNAVAILABLE", getDiscoveryErrorMessage(error));
  }
}

function bindGeneratedCards() {
  document.querySelectorAll("[data-open-modal]").forEach(button => {
    button.addEventListener("click", () => {
      const encoded = button.getAttribute("data-open-modal");
      const data = JSON.parse(decodeURIComponent(encoded));
      openModal(data);
    });
  });
}

function buildStaffCard(item) {
  const fm = item.frontmatter;
  const title = fm.name || item.file.name.replace(/\.md$/i, "").replace(/[-_]+/g, " ");
  const role = fm.role || "STAFF";
  const intro = truncate(stripMarkdown(item.body), 150);
  const avatar = fm.avatar ? resolveAsset(fm.avatar, item.file.path) : "";
  const media = avatar
    ? `<img class="avatar" src="${escapeAttr(avatar)}" alt="" loading="lazy">`
    : `<div class="avatar-fallback" aria-hidden="true">${escapeHtml(initials(title))}</div>`;
  const modal = encodeURIComponent(JSON.stringify({
    title,
    meta: role,
    body: renderMarkdown(item.body, item.file.path),
    media: avatar ? `<img class="modal-media-image" src="${escapeAttr(avatar)}" alt="">` : ""
  }));
  return `
    <article class="card reveal in-view" data-open-modal="${escapeAttr(modal)}" tabindex="0" role="button" aria-label="Open ${escapeAttr(title)}">
      <div class="card-media">${media}</div>
      <div class="card-body">
        <h3>${escapeHtml(title)}</h3>
        <span class="card-role">${escapeHtml(role)}</span>
        <p class="card-description">${escapeHtml(intro)}</p>
        <div class="card-footer">OPEN INTRO →</div>
      </div>
    </article>`;
}

function absoluteAssetUrl(path) {
  if (!path) return "";
  try {
    return new URL(path, document.baseURI).href;
  } catch {
    return path;
  }
}

function buildPluginCard(item) {
  const fm = item.frontmatter;
  const title = fm.name || fm.title || item.file.name.replace(/\.md$/i, "").replace(/[-_]+/g, " ");
  const desc = fm.description || truncate(stripMarkdown(item.body), 150);
  const version = fm.version ? `v${fm.version}` : "DETAILS";
  const icon = fm.image ? absoluteAssetUrl(resolveAsset(fm.image, item.file.path)) : "";
  const modal = encodeURIComponent(JSON.stringify({
    title,
    meta: `PLUGIN / ${version}`,
    body: renderMarkdown(item.body, item.file.path),
    media: icon ? `<img class="modal-media-image" src="${escapeAttr(icon)}" alt="">` : ""
  }));
  return `
    <article class="card reveal in-view" data-open-modal="${escapeAttr(modal)}" tabindex="0" role="button">
      <div class="card-media plugin-card-media">
        ${icon
          ? `<img class="avatar plugin-icon" src="${escapeAttr(icon)}" alt="${escapeAttr(title)} icon" loading="lazy" decoding="async">`
          : `<div class="avatar-fallback" aria-hidden="true">&lt;/&gt;</div>`}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(title)}</h3>
        <span class="card-role">${escapeHtml(version)}</span>
        <p class="card-description">${escapeHtml(truncate(desc, 170))}</p>
        <div class="card-footer">HOW TO USE →</div>
      </div>
    </article>`;
}

function buildModCard(item) {
  const fm = item.frontmatter;
  const title = fm.name || fm.title || item.file.name.replace(/\.md$/i, "").replace(/[-_]+/g, " ");
  const desc = fm.description || truncate(stripMarkdown(item.body), 150);
  const badge = fm.type || "MOD";
  const modal = encodeURIComponent(JSON.stringify({
    title,
    meta: badge,
    body: renderMarkdown(item.body, item.file.path),
    media: fm.image ? `<img class="modal-media-image" src="${escapeAttr(resolveAsset(fm.image, item.file.path))}" alt="">` : ""
  }));
  return `
    <article class="card reveal in-view" data-open-modal="${escapeAttr(modal)}" tabindex="0" role="button">
      <div class="card-media">
        <div class="avatar-fallback" aria-hidden="true">M</div>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(title)}</h3>
        <span class="card-role">${escapeHtml(badge)}</span>
        <p class="card-description">${escapeHtml(truncate(desc, 170))}</p>
        <div class="card-footer">VIEW MOD →</div>
      </div>
    </article>`;
}

function buildNoticeCard(item) {
  const fm = item.frontmatter;
  const title = fm.title || fm.name || item.file.name.replace(/\.md$/i, "").replace(/[-_]+/g, " ");
  const date = fm.date || "DATE TBC";
  const desc = fm.description || truncate(stripMarkdown(item.body), 190);
  const external = fm.link || fm.discord;
  const action = external
    ? `<a class="notice-link" href="${escapeAttr(external)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">OPEN LINK →</a>`
    : `<span class="notice-link">READ →</span>`;
  const modal = encodeURIComponent(JSON.stringify({
    title,
    meta: date,
    body: renderMarkdown(item.body, item.file.path),
    media: fm.image ? `<img class="modal-media-image" src="${escapeAttr(resolveAsset(fm.image, item.file.path))}" alt="">` : ""
  }));
  return `
    <article class="notice reveal in-view" data-open-modal="${escapeAttr(modal)}" tabindex="0" role="button">
      <div class="notice-date">${escapeHtml(date)}</div>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(truncate(desc, 210))}</p>
      </div>
      ${action}
    </article>`;
}

function buildGalleryItem(item) {
  const fm = item.frontmatter;
  const title = fm.title || fm.name || humanizeFilename(item.file.name);
  const caption = fm.caption || truncate(stripMarkdown(item.body), 120);
  const tag = fm.tag || fm.category || "";
  const src = item.file.path;
  const modal = encodeURIComponent(JSON.stringify({
    title,
    meta: tag || "GALLERY",
    body: caption ? `<p>${escapeHtml(caption)}</p>` : "",
    media: `<img class="modal-media-image" src="${escapeAttr(src)}" alt="${escapeAttr(title)}">`
  }));
  return `
    <button class="gallery-item reveal in-view" type="button" data-open-modal="${escapeAttr(modal)}" aria-label="Open ${escapeAttr(title)}">
      <img src="${escapeAttr(src)}" alt="${escapeAttr(title)}" loading="lazy">
      <span class="gallery-caption">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(tag || caption || "Open image")}</span>
      </span>
    </button>`;
}

async function discoverFiles(directory, extension = null, imageExtensions = []) {
  const githubUrl = buildGithubApiUrl(directory);
  if (githubUrl) {
    const cacheKey = `bs-dir:${githubUrl}`;
    const cached = readCache(cacheKey);
    if (cached) return normalizeGithubListing(cached, extension, imageExtensions);

    const response = await fetch(githubUrl, { headers: { "Accept": "application/vnd.github+json" }});
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const data = await response.json();
    writeCache(cacheKey, data, CONFIG.githubApiCacheMinutes);
    return normalizeGithubListing(data, extension, imageExtensions);
  }

  // Static-host fallback. A local/other host cannot enumerate directories
  // without a server API, so use a small optional manifest if provided.
  try {
    const raw = await fetch("content/manifest.json");
    if (!raw.ok) throw new Error("No manifest");
    const manifest = await raw.json();
    const values = manifest[directory] || [];
    return values.map(path => ({ path, name: path.split("/").pop() }));
  } catch {
    throw new Error("Directory enumeration is only automatic on GitHub Pages. For another host, add content/manifest.json.");
  }
}

function normalizeGithubListing(data, extension, imageExtensions) {
  if (!Array.isArray(data)) return [];
  return data
    .filter(item => item.type === "file")
    .filter(item => {
      if (extension) return item.name.toLowerCase().endsWith(extension.toLowerCase()) && !item.name.startsWith("_") && !/^readme\.md$/i.test(item.name);
      if (imageExtensions.length) return imageExtensions.includes(item.name.split(".").pop().toLowerCase());
      return true;
    })
    .map(item => ({ path: item.path, name: item.name }));
}

function buildGithubApiUrl(directory) {
  const host = window.location.hostname;
  if (!host.endsWith(".github.io")) return null;

  const owner = host.split(".")[0];
  const parts = window.location.pathname.split("/").filter(Boolean);
  const repo = parts.length ? parts[0] : `${owner}.github.io`;
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${directory.replace(/^\/+/, "")}`;
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  return await response.text();
}

function parseMarkdownFile(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) return { frontmatter: {}, body: text.trim() };

  const end = text.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: {}, body: text.trim() };

  const yaml = text.slice(3, end).trim();
  const body = text.slice(end + 4).trim();
  return { frontmatter: parseFrontmatter(yaml), body };
}

function parseFrontmatter(raw) {
  const fm = {};
  raw.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) return;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fm[match[1].toLowerCase()] = value;
  });
  return fm;
}

/* Small safe Markdown renderer: headings, paragraphs, lists, quote,
   code fences, bold/italic, links and images. */
function renderMarkdown(raw, sourcePath = "") {
  const sourceDir = sourcePath.includes("/") ? sourcePath.slice(0, sourcePath.lastIndexOf("/") + 1) : "";
  const lines = String(raw || "").split(/\r?\n/);
  const out = [];
  let inCode = false, code = [];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else inCode = true;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (!line.trim()) { out.push(""); continue; }

    if (/^#{1,4}\s+/.test(line)) {
      const n = line.match(/^(#{1,4})\s+/)[1].length;
      const text = line.replace(/^#{1,4}\s+/, "");
      out.push(`<h${n}>${formatInline(text, sourceDir)}</h${n}>`);
    } else if (/^>\s?/.test(line)) {
      out.push(`<blockquote>${formatInline(line.replace(/^>\s?/, ""), sourceDir)}</blockquote>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      out.push(`<li>${formatInline(line.replace(/^\s*[-*]\s+/, ""), sourceDir)}</li>`);
    } else if (/^\s*\d+\.\s+/.test(line)) {
      out.push(`<li>${formatInline(line.replace(/^\s*\d+\.\s+/, ""), sourceDir)}</li>`);
    } else {
      out.push(`<p>${formatInline(line, sourceDir)}</p>`);
    }
  }

  // Convert adjacent li blocks into lists.
  let html = out.join("\n");
  html = html.replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, match => `<ul>${match}</ul>`);
  return html;
}

function formatInline(text, sourceDir) {
  let s = escapeHtml(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    `<img src="${escapeAttr(resolveAsset(url, sourceDir))}" alt="${escapeAttr(alt)}" loading="lazy">`
  );
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, label, url) =>
    `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

function resolveAsset(path, sourcePath = "") {
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path.slice(1);
  if (path.startsWith("./") || path.startsWith("../")) {
    const base = sourcePath.endsWith("/") ? sourcePath : sourcePath.slice(0, sourcePath.lastIndexOf("/") + 1);
    const stack = (base + path).split("/");
    const resolved = [];
    for (const part of stack) {
      if (!part || part === ".") continue;
      if (part === "..") resolved.pop();
      else resolved.push(part);
    }
    return resolved.join("/");
  }
  return path;
}

function stripMarkdown(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ");
}

function frontmatterOrderSort(a, b) {
  const ao = Number(a.frontmatter.order || 9999);
  const bo = Number(b.frontmatter.order || 9999);
  if (ao !== bo) return ao - bo;
  return frontmatterNameSort(a, b);
}

function frontmatterNameSort(a, b) {
  const an = (a.frontmatter.name || a.frontmatter.title || a.file.name).toLowerCase();
  const bn = (b.frontmatter.name || b.frontmatter.title || b.file.name).toLowerCase();
  return an.localeCompare(bn);
}

function parseDateValue(value) {
  const t = Date.parse(value || "");
  return Number.isNaN(t) ? 0 : t;
}

function initials(text) {
  const words = text.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "MC";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function humanizeFilename(name) {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, m => m.toUpperCase());
}

function truncate(text, max) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function escapeAttr(value) { return escapeHtml(value); }

function containerHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html || "";
  bindGeneratedCards();
}

function getDiscoveryErrorMessage(error) {
  const msg = String(error?.message || error || "");
  if (msg.includes("GitHub API 403") || msg.includes("GitHub API 429")) {
    return "Please try again in a moment.";
  }
  if (msg.includes("Directory enumeration")) {
    return "This content is currently unavailable.";
  }
  return "Please try again later.";
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.savedAt > item.ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch { return null; }
}

function writeCache(key, data, minutes) {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      savedAt: Date.now(),
      ttl: minutes * 60 * 1000,
      data
    }));
  } catch {}
}
