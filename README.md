[English](README.md) | [简体中文](README_zh-CN.md)

# Auto Install Skills

**One command to equip your Agents with new skills.**

This tool finds AI Agents on your computer (Antigravity, Claude Code, Windsurf, Gemini CLI) and installs Markdown-based skills (`SKILL.md`) from GitHub repositories directly into them.

## 🚀 Usage

Build and run:
```bash
npx auto-install-skills install
```

Just follow the interactive prompts:
1.  **Select Agent**: Choose where to install (e.g., Antigravity).
2.  **Select Source**: Choose a preset repo (like `anthropics/skills`) or paste a URL.
3.  **Select Skills**: Pick the skills you want.

That's it!

## 📦 Features

*   **Auto-Detect**: Finds your agents automatically.
*   **One-Click**: No manual downloading or copying files.
*   **Smart**: Handles nested folders and conflicts (Overwrite/Skip).

## 🛠 Supported Agents

*   **Antigravity**
*   **Claude Code**
*   **Windsurf**
*   **Gemini CLI**

## Build Locally

```bash
npm install
npm run build
```

License: ISC
