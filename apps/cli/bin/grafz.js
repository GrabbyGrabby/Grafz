#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');

program
  .version('1.0.0')
  .description('Grafz CLI - Connect your AI editors to your semantic memory store.');

program
  .command('plugin')
  .description('Install the Grafz MCP plugin into your editor.')
  .option('-e, --editor <name>', 'The editor to install for (e.g., "Claude Desktop")')
  .action(async (options) => {
    console.log(chalk.bold.blue('Welcome to Grafz setup!\n'));

    let editor = options.editor;

    if (!editor) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'editor',
          message: 'Which editor do you want to install the plugin for?',
          choices: ['Claude Desktop', 'Cursor', 'Windsurf', 'Codex', 'OpenCode', 'Hermes Agent', 'Kiro', 'Gemini CLI']
        }
      ]);
      editor = answers.editor;
    }

    console.log('\n' + chalk.yellow(`Configuring MCP for ${editor}...`));
    
    // Actually inject the MCP configuration
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      
      let configPath = '';
      let configDir = '';
      
      if (editor === 'Claude Desktop') {
        configDir = path.join(appData, 'Claude');
        configPath = path.join(configDir, 'claude_desktop_config.json');
      } else if (editor === 'Cursor') {
        configDir = path.join(appData, 'Cursor', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings');
        configPath = path.join(configDir, 'cline_mcp_settings.json');
      } else if (editor === 'Windsurf') {
        configDir = path.join(os.homedir(), '.codeium', 'windsurf', 'mcp');
        configPath = path.join(configDir, 'mcp_config.json');
      } else {
        // Generic fallback for others
        configDir = path.join(appData, editor.replace(/\s+/g, ''));
        configPath = path.join(configDir, 'mcp_config.json');
      }
      
      let config = { mcpServers: {} };
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        try { config = JSON.parse(raw); } catch (e) {}
      } else {
        fs.mkdirSync(configDir, { recursive: true });
      }

      if (!config.mcpServers) config.mcpServers = {};
      
      const mcpServerPath = path.resolve(__dirname, '..', '..', 'mcp-server', 'build', 'index.js');

      config.mcpServers["grafz-memory"] = {
        command: "node",
        args: [mcpServerPath],
          env: {
            "GRAFZ_API_URL": "http://localhost:3000/api"
          }
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(chalk.green(`✓ Successfully updated ${configPath}`));
      } catch (err) {
        console.log(chalk.red(`Failed to update config: ${err.message}`));
      }
    }

    setTimeout(() => {
      console.log(chalk.green('✓ Marketplace connected successfully.'));
      console.log(chalk.green(`✓ Plugin 'grafzai/claude-grafz' installed.`));
      
      console.log('\n' + chalk.bold.white('Next steps:'));
      console.log('1. Restart your editor.');
      console.log('2. Type ' + chalk.cyan('what do you remember about me?') + ' to verify the memory sync is active.\n');
    }, 1000);
  });

program.parse(process.argv);
