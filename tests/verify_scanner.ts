import { scanForAgents } from '../src/scanner';
import chalk from 'chalk';

async function verifyScanner() {
    console.log(chalk.blue('1. Testing Scanner Detection Logic...'));
    const agents = await scanForAgents();
    
    if (agents.length === 0) {
        console.log(chalk.yellow('No agents installed on this machine (or detection failed).'));
    } else {
        console.log(chalk.green(`Found ${agents.length} agents:`));
        agents.forEach(a => console.log(`- ${a.name} @ ${a.skillsPath}`));
    }

    // Verify specifically for expected local setup (Antigravity should be found)
    const ag = agents.find(a => a.name === 'Antigravity');
    if (ag) {
        console.log(chalk.green('✓ Antigravity detected via dir check.'));
    } else {
        console.log(chalk.red('✗ Antigravity NOT detected (Check logic).'));
    }
}

verifyScanner().catch(console.error);
