import { Command } from 'commander';
import chalk from 'chalk';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { select, input, checkbox } from '@inquirer/prompts';
import { scanForAgents } from './scanner';
import { fetchRepo, listSkillsInRepo } from './fetcher';
import { installSkill } from './installer';
import { AgentConfig } from './types';

const program = new Command();

program
  .name('auto-install-skills')
  .description('CLI to automate installing Agent Skills')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for supported AI Agents and their skills directories')
  .action(async () => {
    if (os.platform() === 'win32') {
      console.error(chalk.red('Error: Windows is not currently supported.'));
      process.exit(1);
    }
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

program
  .command('install')
  .description('Install skills from a GitHub repository')
  .action(async () => {
    if (os.platform() === 'win32') {
      console.error(chalk.red('Error: Windows is not currently supported.'));
      process.exit(1);
    }

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
      message: 'Select Target Agent:', 
      // Feature: Show installed skills count + Numbered options
      choices: agents.map((a: AgentConfig, index: number) => {
        const countStr = a.installedSkillsCount !== undefined ? ` [${a.installedSkillsCount} skills]` : '';
        return { 
            name: `${index + 1}. ${a.name}${countStr} (${a.skillsPath})`, 
            value: a 
        };
      })
    }) as AgentConfig;

    // 3. Select Skill Source
    const PRESET_REPOS = [
      { name: '1. Anthropics Official Skills (https://github.com/anthropics/skills)', value: 'https://github.com/anthropics/skills' },
      { name: '2. ComposioHQ Awesome Claude Skills (https://github.com/ComposioHQ/awesome-claude-skills)', value: 'https://github.com/ComposioHQ/awesome-claude-skills' },
      { name: '3. Obra Superpowers (https://github.com/obra/superpowers)', value: 'https://github.com/obra/superpowers' },
      { name: '4. Enter Custom URL...', value: 'custom' }
    ];

    let repoUrl = await select({
      message: 'Select a Skill Repository', 
      choices: PRESET_REPOS
    });

    if (repoUrl === 'custom') {
      repoUrl = await input({
        message: 'Enter GitHub Repository URL (containing skills):',
        default: 'https://github.com/anthropics/skills'
      });
    }

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
        // Feature: Numbered options for skills
        choices: skills.map((s, i) => ({ name: `${i + 1}. ${s}`, value: s }))
      });

      if (selectedSkills.length === 0) {
        console.log('No skills selected.');
        return;
      }

      // 6. Install
      let successCount = 0;
      let skippedCount = 0;
      let globalConflictAction: 'overwrite' | 'skip' | null = null;
      
      for (const skillName of selectedSkills) {
        const skillSource = path.join(localRepoPath, skillName);
        const targetName = path.basename(skillName);
        const targetPath = path.join(targetAgent.skillsPath, targetName);
        
        console.log(chalk.blue(`Preparing to install ${targetName}...`));

        let shouldInstall = true;

        if (await fs.pathExists(targetPath)) {
            // Check if we have a "for all" action set
            let action = globalConflictAction ? globalConflictAction : null;

            if (!action) {
                // Prompt user
                // Feature: Numbered options for conflict resolution
                const response = await select({
                    message: `Skill '${targetName}' already exists. What do you want to do?`,
                    choices: [
                        { name: '1. Overwrite', value: 'overwrite' },
                        { name: '2. Overwrite All (Apply to future conflicts)', value: 'overwrite_all' },
                        { name: '3. Skip', value: 'skip' },
                        { name: '4. Skip All (Apply to future conflicts)', value: 'skip_all' },
                        { name: '5. Cancel Installation', value: 'cancel' }
                    ]
                });

                if (response === 'overwrite_all') {
                    globalConflictAction = 'overwrite';
                    action = 'overwrite';
                } else if (response === 'skip_all') {
                    globalConflictAction = 'skip';
                    action = 'skip';
                } else if (response === 'cancel') {
                    console.log(chalk.yellow('Installation cancelled by user.'));
                    break;
                } else {
                    action = response as 'overwrite' | 'skip';
                }
            }

            if (action === 'skip') {
                console.log(chalk.gray(`Skipped ${targetName}.`));
                skippedCount++;
                shouldInstall = false;
            }
        }

        if (shouldInstall) {
            await installSkill(skillSource, targetAgent.skillsPath, targetName); 
            console.log(chalk.green(`✓ ${targetName} installed.`));
            successCount++;
        }
      }

      // Summary
      console.log('\n' + chalk.bold.cyan('Installation Summary:'));
      console.log(`Target Agent: ${chalk.bold(targetAgent.name)}`);
      console.log(`Destination:  ${targetAgent.skillsPath}`);
      console.log(`Installed:    ${chalk.green(successCount)}`);
      console.log(`Skipped:      ${chalk.yellow(skippedCount)}`);
      if (successCount > 0) console.log(chalk.green('✨ Auto Install Skills execution complete!'));

    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
    }
  });

program.parse(process.argv);
