#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const chalk = require("chalk");
const { program } = require("commander");

program
  .version("1.0.0")
  .description("Install the Grafz MCP server for Claude and Cursor")
  .command("plugin")
  .action(async () => {
    console.log(chalk.blue("Grafz MCP Plugin Installer"));

    const config = {
      mcpServers: {
        "grafz-memory": {
          command: "bun",
          args: [
            "run",
            path.resolve(process.cwd(), "apps/web/mcp-server.ts")
          ]
        }
      }
    };

    let claudeConfigPath = "";
    if (process.platform === "win32") {
      claudeConfigPath = path.join(os.homedir(), "AppData", "Roaming", "Claude", "claude_desktop_config.json");
    } else if (process.platform === "darwin") {
      claudeConfigPath = path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
    }

    if (claudeConfigPath && fs.existsSync(path.dirname(claudeConfigPath))) {
      let existingConfig = {};
      if (fs.existsSync(claudeConfigPath)) {
        existingConfig = fs.readJsonSync(claudeConfigPath, { throws: false }) || {};
      }
      
      existingConfig.mcpServers = {
        ...existingConfig.mcpServers,
        ...config.mcpServers
      };
      
      fs.outputJsonSync(claudeConfigPath, existingConfig, { spaces: 2 });
      console.log(chalk.green("? Successfully installed to Claude Desktop"));
    } else {
      console.log(chalk.yellow("! Claude Desktop config folder not found."));
    }

    console.log(chalk.green("\nInstallation complete. Please restart your editors."));
  });

program.parse(process.argv);

