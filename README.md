# Bandrami SMP Minecraft Community Website

Static HTML/CSS/vanilla-JavaScript website for GitHub Pages. No backend, database, authentication, server process, or always-on PC is required.

The supplied Canva-style reference is stored in `reference/INFO.png`, and the supplied server logo is stored at `assets/logo/server-logo.png`.

## Current real information included

- Server/community name: **Bandrami SMP**
- Discord invite: `https://discord.gg/Y4QWhVrg5Z`
- Staff: ZEKO_PX, YvngSmoke, and asher
- Gallery: intentionally empty
- Unprovided server/plugin/mod/notice details: left ready for you to add later

## 1. Project structure

```text
bs-minecraft-community/
├── index.html
├── 404.html
├── style.css
├── script.js
├── .nojekyll
├── README.md
├── assets/
│   ├── logo/
│   │   └── server-logo.png
│   ├── staff/
│   └── gallery/
│       └── _KEEP_EMPTY.txt
├── content/
│   ├── manifest.json
│   ├── server/
│   │   ├── server-info.md
│   │   ├── rules.md
│   │   └── modpack.md
│   ├── join/
│   │   └── how-to-join.md
│   ├── staff/
│   │   ├── zeko-px.md
│   │   ├── yvngsmoke.md
│   │   └── asher.md
│   ├── plugins/
│   │   └── _KEEP_EMPTY.txt
│   ├── mods/
│   │   └── _KEEP_EMPTY.txt
│   └── notices/
│       └── _KEEP_EMPTY.txt
└── reference/
    └── INFO.png
```

## 2. Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload **everything inside this folder** to the repository root.
3. Commit the files.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the branch containing the site, usually `main`, and folder `/ (root)`.
7. Wait for GitHub Pages to deploy, then open the Pages URL.

The site is designed to discover Markdown content and gallery images from your public GitHub repository automatically.

## 3. Important local-testing note

Do not normally double-click `index.html` and expect the dynamic content to work. The browser may block `fetch()` when using `file://`.

For testing on your PC, use a local server such as:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## 4. Add a new staff member

Create a file such as:

```text
content/staff/player4.md
```

Paste:

```md
---
name: Player Name
role: Support
order: 4
avatar: assets/staff/player4.png
---

Write the introduction here.

Add responsibilities, Discord/contact information, or social links here if needed.

**Optional closing line.**
```

Put the avatar at:

```text
assets/staff/player4.png
```

No HTML edit is needed.

## 5. Add a plugin

Create one Markdown file per plugin in:

```text
content/plugins/
```

Example:

```text
content/plugins/essentialsx.md
```

Use this template:

```md
---
name: EssentialsX
version: 2.x
description: Short description.
image: assets/plugins/essentialsx.png
---

# What it does

Explain the plugin.

## Important features

- Feature 1
- Feature 2
- Feature 3

## Commands

`/example`

Explain the command.

## Permissions

`example.permission`

Explain it here.

## How to use

Write the player instructions here.

## Useful links

[Official website](https://example.com)
```

You can create `assets/plugins/` yourself later if you want plugin screenshots.

## 6. Add a mod

Create one file per mod in:

```text
content/mods/
```

Example template:

```md
---
name: Mod Name
type: Required
description: Short description.
image: assets/mods/mod-name.png
---

# What it does

Explain the mod.

## Compatibility

Minecraft version:

Loader:

## Installation

1. Step one.
2. Step two.

## Notes

Anything important for players.
```

## 7. Add a notice

Create one file per announcement in:

```text
content/notices/
```

Example:

```text
content/notices/server-update.md
```

Template:

```md
---
title: Server Update
date: 2026-10-01
description: Short preview for the notice card.
image: assets/notices/server-update.png
discord: https://discord.gg/Y4QWhVrg5Z
link: https://example.com/
---

# Server Update

Write the full announcement here.
```

The `date:` field sorts notices newest first.

## 8. Keep the gallery empty for now

No gallery screenshots have been added. When you are ready, put images directly into:

```text
assets/gallery/
```

Supported formats are `.png`, `.jpg`, `.jpeg`, `.webp`, and `.gif`.

Optional matching Markdown sidecars can add captions and tags, for example:

```text
assets/gallery/spawn.png
assets/gallery/spawn.md
```

Example sidecar:

```md
---
title: Spawn
tag: Build
caption: Main community build.
---
```

## 9. Files still waiting for real information

You have not provided the real details for these yet:

- `content/server/server-info.md` — Minecraft version, gameplay style, server concept, etc.
- `content/server/rules.md` — actual server/community rules
- `content/server/modpack.md` — real modpack name, loader, version, install steps, downloads
- `content/plugins/` — one file for every real plugin
- `content/mods/` — one file for every real mod
- `content/notices/` — one file for each announcement
- `assets/gallery/` — screenshots when you are ready
- `assets/staff/` — optional staff avatars

## 10. Discord

The current Discord invite is configured in both `script.js` and `content/join/how-to-join.md`:

```text
https://discord.gg/Y4QWhVrg5Z
```

Do not add the Minecraft server IP/address to the site. The Join section intentionally directs visitors to Discord for current status and joining information.

## Current Bandrami SMP content

The project currently includes 7 staff profiles and these 5 plugins: Lifesteal, Bliss SMP, ShopGUI, Auction, and Simple Voice Chat. Gallery, mods, and notices are intentionally empty.

The Discord invite is `https://discord.gg/Y4QWhVrg5Z`.

