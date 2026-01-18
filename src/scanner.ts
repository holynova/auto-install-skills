import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { AgentConfig } from './types';

interface AgentDef {
  name: string;
  skillsPath: string;
  checkType: 'app' | 'cli' | 'dir'; // How to check if installed
  checkValue: string; // App path, CLI command name, or specific dir
}

const HOME = os.homedir();

export const SUPPORTED_AGENTS: AgentDef[] = [
  {
    name: 'Antigravity',
    skillsPath: path.join(HOME, '.gemini/antigravity/skills'),
    checkType: 'dir', 
    checkValue: path.join(HOME, '.gemini/antigravity') // Assuming existence of this dir means installed
  },
  {
    name: 'Claude Code',
    skillsPath: path.join(HOME, '.claude/skills'),
    checkType: 'cli',
    checkValue: 'claude'
  },
  {
    name: 'Cursor',
    skillsPath: path.join(HOME, '.cursor/skills'),
    checkType: 'app',
    checkValue: '/Applications/Cursor.app'
  },
  {
    name: 'Windsurf',
    skillsPath: path.join(HOME, '.codeium/windsurf/skills'), // Speculative
    checkType: 'app',
    checkValue: '/Applications/Windsurf.app'
  },
  {
    name: 'Gemini CLI',
    skillsPath: path.join(HOME, '.gemini/skills'),
    checkType: 'cli',
    checkValue: 'gemini'
  }
];

function isSoftwareInstalled(agent: AgentDef): boolean {
  try {
    switch (agent.checkType) {
      case 'app':
        return fs.existsSync(agent.checkValue);
      case 'cli':
        execSync(`which ${agent.checkValue}`, { stdio: 'ignore' });
        return true;
      case 'dir':
        return fs.existsSync(agent.checkValue);
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
}

export async function scanForAgents(): Promise<AgentConfig[]> {
  const foundAgents: AgentConfig[] = [];

  for (const agent of SUPPORTED_AGENTS) {
    const installed = isSoftwareInstalled(agent);

    if (installed) {
        // If installed, we return it. We verify if the *skills path* exists separately?
        // Or we just return it and let the installer create the directory if needed.
        // The previous logic checked for skills path existence. 
        // New logic: Check software -> Return. Installer should ensureDir.
      
      let installedSkillsCount = 0;
      const skillsDirExists = await fs.pathExists(agent.skillsPath);
      
      if (skillsDirExists) {
          try {
            const entries = await fs.readdir(agent.skillsPath, { withFileTypes: true });
            // Count directories that are not hidden
            installedSkillsCount = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).length;
          } catch (e) {
            // Ignore error if we can't read dir
          }
      }
      
      foundAgents.push({
        name: agent.name,
        skillsPath: agent.skillsPath,
        exists: true, // "exists" meant "agent found" regardless of skills dir in the new logic
        installedSkillsCount
      });
    }
  }

  return foundAgents;
}
