const chalk = require("chalk");
const Discord = require("discord.js");
const child_process = require("child_process");
const fs = require("fs");
const config = require("./config.js");
const { Manager } = require("erela.js");
if(config.lavalink.enabled) {
async function downloadLavalink() {
  console.log(chalk.blue("Downloading Lavalink Stable Build..."));

  const downloadProcess = child_process.spawn("curl", [
    "-L",
    "https://cdn.tejas404.xyz/Lavalink.jar",
    "-o",
    "Lavalink.jar",
  ]);

  return new Promise((resolve, reject) => {
    downloadProcess.on("exit", (code) => {
      if (code === 0) {
        console.log(chalk.green("Downloaded Lavalink Stable Build!"));
        resolve();
      } else {
        console.log(chalk.red("Failed to download Lavalink Stable Build."));
        reject();
      }
    });
  });
}
async function startLavalink() {
  try {
    await downloadLavalink();
    //check if file exists the delete it
    if (fs.existsSync("Lavalink-visa2code.jar")) {
      fs.unlinkSync("Lavalink-visa2code.jar");
    }
    fs.renameSync("Lavalink.jar", "Lavalink-visa2code.jar");
    console.log(chalk.blue("Starting Lavalink..."));
    const lavalinkProcess = child_process.spawn("java", [
      "-jar",
      "Lavalink-visa2code.jar",
    ]);
    lavalinkProcess.on("exit", (code) => {
      console.log(chalk.red(`Lavalink exited with code ${code}.`));
    });
    lavalinkProcess.stdout.on("data", (data) => {
      console.log(chalk.blue(data.toString()));
    });
    lavalinkProcess.stderr.on("data", (data) => {
      console.log(chalk.red(data.toString()));
    });
  } catch (error) {
    console.error(chalk.red("An error occurred:", error));
  }
}
startLavalink();
}

if(config.discord_bot.enabled) {
const client = new Discord.Client({
  disableMentions: "everyone",
  partials: [Discord.Partials.Channel, Discord.Partials.Message],
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.DirectMessageReactions]
});
client.manager = new Manager({
  nodes: config.lavalink.nodes,
  retryDelay: config.lavalink.retryDelay,
  retryAmount: config.lavalinkretryAmount,
  send: config.lavalink.send,
})
  .on("nodeConnect", (node) =>
    console.log(
      chalk.green(
        `[NODE] ${node.options.identifier} | Lavalink node is connected.`
      )
    )
  )
  .on("nodeReconnect", (node) =>
    console.log(
      chalk.yellow(
        `[NODE] ${node.options.identifier} | Lavalink node is reconnecting.`
      )
    )
  )
  .on("nodeDisconnect", (node) =>
    console.log(
      chalk.red(
        `[NODE] ${node.options.identifier} | Lavalink node is disconnected.`
      )
    )
  );
client.on("ready", () => {
  client.manager.init(client.user.id);
})
 
  client.login(config.discord_bot.token);
}


process.on("unhandledRejection", (error) => {
  console.log(error);
});
process.on("uncaughtException", (error) => {
  console.log(error);
});