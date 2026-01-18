[English](README.md) | [简体中文](README_zh-CN.md)

# Auto Install Skills

**一行命令，为你的 AI Agent 装备新技能。**

这个工具会自动扫描你电脑上的 AI 软件（如 Antigravity, Claude Code, Windsurf），并将 GitHub 上的 Skill (Markdown 指令) 一键安装进去。

## 🚀 怎么用？

直接运行：
```bash
npx auto-install-skills install
```

然后跟着提示选：
1.  **选 Agent**: 你想给谁装技能？(比如 Antigravity)
2.  **选仓库**: 选官方推荐的 (如 `anthropics/skills`) 还是你自己找的 GitHub 链接？
3.  **选技能**: 勾选你想要的技能。

搞定！工具会自动下载并安装好。

## �主要功能

*   **自动发现**: 自动识别已安装的 Agent，不需要你去找配置目录。
*   **一键安装**: 省去手动下载、解压、复制粘贴的麻烦。
*   **智能处理**: 支持批量覆盖或跳过重复文件。

## 🛠 支持软件

*   **Antigravity**
*   **Claude Code**
*   **Windsurf**
*   **Gemini CLI**

## 本地开发

```bash
npm install
npm run build
```

License: ISC
