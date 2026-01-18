#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { scanForAgents } from './scanner';

const program = new Command();

program
  .name('auto-config-skills')
  .description('CLI to automate installing Agent Skills')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for supported AI Agents and their skills directories')
  .action(async () => {
    console.log(chalk.blue('Scanning for installed AI Agents...'));
    const agents = await scanForAgents();
    if (agents.length === 0) {
      console.log(chalk.yellow('No supported agents found.'));
    } else {
      console.log(chalk.green(`Found ${agents.length} agents:`));
      agents.forEach((agent: AgentConfig) => {
        const countStr = agent.installedSkillsCount !== undefined ? ` | ${agent.installedSkillsCount} skills installed` : '';
        console.log(`- ${chalk.bold(agent.name)}: ${agent.skillsPath} (${agent.exists ? 'Found' : 'Not Found'}${countStr})`);
      });
    }
  });

import { select, input, checkbox } from '@inquirer/prompts';
import { fetchRepo, listSkillsInRepo } from './fetcher';
import { installSkill } from './installer';
import { AgentConfig } from './types';
import path from 'path';

program
  .command('install')
  .description('Install skills from a GitHub repository')
  .action(async () => {
    // 1. Scan for Agents
    console.log(chalk.gray('[Debug] Scanning for agents...'));
    const agents = await scanForAgents();
    console.log(chalk.gray(`[Debug] Found ${agents.length} agents.`));

    if (agents.length === 0) {
      console.log(chalk.red('No supported agents found. Cannot install skills.'));
      return;
    }

    // 2. Select Target Agent
    console.log(chalk.gray('[Debug] Prompting for target agent...'));
    const targetAgent = await select({
      message: 'Select the AI Agent software to install skills into:',
      choices: agents.map((a: AgentConfig) => ({ name: `${a.name} (${a.skillsPath})`, value: a }))
    }) as AgentConfig;

    // 3. Select Skill Source (Hardcoded default for MVP, editable in future)
    // Using a known repo that has reasonable folder structure, or just prompts user.
    // For verification, I'll use a sample repo or allow input.
    const repoUrl = await input({
      message: 'Enter GitHub Repository URL (containing skills):',
      default: 'https://github.com/anthropics/skills' // Warning: Need to handle non-skill repos gracefully
    });

    try {
      console.log(chalk.blue(`Fetching repository ${repoUrl}...`));
      const localRepoPath = await fetchRepo(repoUrl);
      console.log(chalk.green('Repository fetched.'));

      // 4. List available skills
      const skills = await listSkillsInRepo(localRepoPath);
      if (skills.length === 0) {
         console.log(chalk.yellow('No skills (folders with SKILL.md) found in this repository.'));
         return;
      }

      // 5. Select Skills to Install
      const selectedSkills = await checkbox({
        message: 'Select skills to install:',
        choices: skills.map(s => ({ name: s, value: s }))
      });

      if (selectedSkills.length === 0) {
        console.log('No skills selected.');
        return;
      }

      // 6. Install
      for (const skillName of selectedSkills) {
        const skillSource = path.join(localRepoPath, skillName);
        console.log(chalk.blue(`Installing ${skillName}...`));
        // Use basename to install 'skills/foo' as just 'foo' in the target directory
        await installSkill(skillSource, targetAgent.skillsPath, path.basename(skillName)); 
        console.log(chalk.green(`✓ ${skillName} installed successfully.`));
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
    }
  });

program.parse(process.argv);
