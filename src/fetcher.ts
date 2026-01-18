import path from 'path';
import fs from 'fs-extra';
import simpleGit from 'simple-git';
import os from 'os';

const CACHE_DIR = path.join(os.tmpdir(), 'auto-config-skills-cache');

export async function fetchRepo(repoUrl: string): Promise<string> {
  const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
  const targetDir = path.join(CACHE_DIR, repoName);

  if (await fs.pathExists(targetDir)) {
      // For MVP, just remove cached dir and re-clone to ensure freshness
      // In production, we might want to git pull instead
      await fs.remove(targetDir);
  }

  await fs.ensureDir(targetDir);
  const git = simpleGit();
  
  try {
    await git.clone(repoUrl, targetDir);
    return targetDir;
  } catch (e) {
    throw new Error(`Failed to clone repository: ${e}`);
  }
}

async function findSkillDirs(dir: string, rootDir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let skills: string[] = [];

    for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const fullPath = path.join(dir, entry.name);
            const skillMdPath = path.join(fullPath, 'SKILL.md');
            
            if (await fs.pathExists(skillMdPath)) {
                // Found a skill, add relative path
                skills.push(path.relative(rootDir, fullPath));
            }

            // Recurse provided we are not too deep (simple heuristic)
            // or just always recurse. Since standard repos aren't huge, recursion is fine.
            // Avoid recursing INTO a skill folder finding nested skills? 
            // The standard implies a skill is a leaf unit. But let's verify.
            // If SKILL.md exists, we assume this IS the skill. 
            // Should we look deeper? Probably not for current standard.
            // But if we want to be safe, maybe don't recurse if found?
            // "If a folder has SKILL.md, it's a skill folder".
            // Let's recurse ONLY if SKILL.md is NOT found?
            // Actually, some repos might organize differently. 
            // Safe bet: Recurse into subdirectories regardless, but exclude the finding itself from being parent of another?
            // Let's just traverse all.
            const subSkills = await findSkillDirs(fullPath, rootDir);
            skills = skills.concat(subSkills);
        }
    }
    return skills;
}

export async function listSkillsInRepo(repoLocalPath: string): Promise<string[]> {
    return findSkillDirs(repoLocalPath, repoLocalPath);
}
