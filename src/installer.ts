import fs from 'fs-extra';
import path from 'path';

export async function installSkill(
    skillSourcePath: string, 
    targetSkillsDir: string, 
    skillName: string
): Promise<void> {
    const destPath = path.join(targetSkillsDir, skillName);
    
    // Ensure parent dir exists
    await fs.ensureDir(targetSkillsDir);

    // Copy overwrite
    await fs.copy(skillSourcePath, destPath, { overwrite: true });
}
