# 项目提案: 自动安装 Agent Skills 工具

## 1. 需求确认 (Requirement Confirmation)
根据 `docs/requirement.md`，项目需求如下：

**目标**: 开发一个自动化工具，用于将 GitHub 上的 Agent Skills 安装到本机已安装的 AI 辅助软件中。

**核心功能**:
1.  **扫描软件**: 检测本机安装的支持 Skills 的软件（如 Claude Code, Gemini CLI, Antigravity, Cursor, Windsurf）。
2.  **定位目录**: 自动识别这些软件存放 Skills 的本地目录路径。
3.  **获取资源**: 从指定的开源 GitHub 仓库下载 Skills (例如 `anthropics/skills`, `ComposioHQ/awesome-claude-skills`, `obra/superpowers`)。
4.  **分发安装**: 将下载的 Skills 文件复制到对应软件的 Skills 目录中。
5.  **交互控制**:
    *   用户可选择是否执行安装。
    *   用户可选择针对哪些软件进行安装（软件范围选择）。
6.  **自动更新**: 支持重新拉取并覆盖安装，实现更新功能。

---

## 2. 待确认问题 (Questions & Clarifications) - 已根据官方定义更新

基于您提供的 [Claude Skills 定义](https://support.claude.com/en/articles/12512176-what-are-skills)，我已重新修正理解：

1.  **概念纠正 (Concept Correction)**:
    *   **Skills (技能/指令)**: 根据定义，Skills 是 **Markdown 文件** (基于 Agent Skills Open Standard)，用于教 AI **"How to do" (如何使用工具/执行流程)**。它们是**指令集**。
    *   **MCP (工具协议)**: MCP 是连接外部服务（如 GitHub, Google Drive）的管道，提供 **"Tools" (能力)**。
    *   **关系**: Skills (Markdown) 往往需要配合 MCP (Tools) 才能发挥最大作用（例如：一个 "Code Review Skill" 可能需要 "GitHub MCP" 来读取 PR）。

2.  **项目核心定位确认**:
    *   本工具的核心目标应该是管理 **Markdown 格式的 Instructional Skills** (Agent Skills Standard, `SKILL.md`)。
    *   **操作逻辑**: 主要是 **文件分发**（下载 `.md` 文件 -> 放入目标软件的 `skills` 目录）。
    *   **待确认点**:
        *   目前主流支持 "Agent Skills Standard" (文件夹 + `SKILL.md`) 的软件主要是 Antigravity 和 Claude Code。
        *   Cursor/Windsurf 虽然也支持 "自然语言规则" (如 `.cursorrules`)，但格式与标准 Skills 不同。
        *   **确认**: 是否需要工具具备**格式转换能力**？(例如：下载了通用的 `SKILL.md`，自动提取 Prompt 转换为 `.cursorrules` 写入 Cursor 目录？还是仅仅只对支持标准协议的软件进行安装？)

3.  **资源源确认**:
    *   注意：很多 GitHub 仓库（如 `anthropics/skills`）实际上主要存放的是 **MCP Servers** 代码，而非 Markdown Skills。
    *   我们需要找到（或让用户提供）真正的 **Instructional Skills** 仓库源（例如 `agentskills.io` 聚合的源，或者专门存放 Prompts/Instructions 的仓库）。

4.  **目标目录识别**:
    *   对于支持标准 Skills 的软件 (如 Antigravity)，目录结构相对统一。
    *   对于其他软件 (Cursor)，我们需要明确写入位置 (如 `.cursorrules` 通常在项目根目录，而非全局配置)。这也是需要确认的策略。

---

## 3. 开发方案选项 (Development Options)

请选择一种技术栈：

### 方案 A: Node.js 交互式 CLI 工具 (推荐)
*   **优点**: 生态丰富 (inquirer, simple-git)，开发效率高，且大多数 Agent 工具本身依赖 Node 环境。
*   **实现**: 使用 TypeScript + Node.js。
*   **形式**: `npm install -g` 或 `npx` 运行。

### 方案 B: Python 脚本
*   **优点**: 文件处理方便，脚本逻辑直观。
*   **形式**: Python package 或独立脚本。

### 方案 C: Go 语言二进制
*   **优点**: 单文件分发，无运行时依赖。
*   **形式**: 编译后的 Binary。

---

请告知您的选择 (A/B/C) 以及对第 2 点问题的反馈。
