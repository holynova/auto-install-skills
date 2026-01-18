export interface AgentConfig {
  name: string;
  skillsPath: string;
  exists: boolean;
  installedSkillsCount?: number;
}

export interface Skill {
  name: string;
  description: string;
  path: string; // GitHub path or local cache path
}
