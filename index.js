const chalk = require("chalk");
const Discord = require("discord.js");
const child_process = require("child_process");
const fs = require("fs");
const config = require("./config.js");
const { Manager } = require("erela.js");
const { prettyBytes } = require("visa2discord");
const moment = require("moment");
require("moment-duration-format");
const asciiArt = `
${chalk.red("        _           ___               _      ")}
${chalk.green("       (_)         |__ \\             | |     ")}
${chalk.blue(" __   ___ ___  __ _   ) |___ ___   __| | ___ ")}
${chalk.yellow(" \\ \\ / / / __|/ _` | / // __/ _ \\ / _` |/ _ \\")}
${chalk.magenta("  \\ V /| \\__ \\ (_| |/ /| (_| (_) | (_| |  __/")}
${chalk.cyan("   \\_/ |_|___/\\__,_|____\\___\\___/ \\__,_|\\___|")}
                                             
                                             
`;

console.log(asciiArt);

console.log(
  `${chalk.red("YouTube:")} ${chalk.red("https://youtube.com/@visa2code")}`
);
console.log(
  `${chalk.blue("Discord:")} ${chalk.blue("https://discord.gg/e3CkRXy7HD")}`
);
console.log(
  `${chalk.gray("GitHub:")} ${chalk.gray("https://github.com/TejasLamba2006")}`
);
if (config.lavalink.enabled) {
  async function downloadLavalink() {
    console.log(chalk.blue("Downloading Lavalink Stable Build..."));

    try {
      await execCommand("curl", [
        "-L",
        "https://cdn.tejas404.xyz/Lavalink.jar",
        "-o",
        "Lavalink.jar",
      ]);
      console.log(chalk.green("Downloaded Lavalink Stable Build!"));
    } catch (error) {
      console.log(chalk.red("Failed to download Lavalink Stable Build."));
      throw error;
    }
  }

  async function startLavalink() {
    try {
      await downloadLavalink();

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

async function execCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(command, args);

    process.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command '${command}' exited with code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

if (config.discord_bot.enabled) {
  const client = new Discord.Client({
    disableMentions: "everyone",
    partials: [Discord.Partials.Channel, Discord.Partials.Message],
    intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.GuildVoiceStates,
      Discord.GatewayIntentBits.GuildMessageReactions,
      Discord.GatewayIntentBits.DirectMessages,
      Discord.GatewayIntentBits.DirectMessageReactions,
    ],
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
  client.on("ready", async () => {
    client.user.setActivity(config.discord_bot.activity.name, {
      type: Discord.ActivityType[config.discord_bot.activity.type],
    });
    console.log(chalk.green(`[CLIENT] ${client.user.tag} is ready.`));
    client.manager.init(client.user.id);
    const channel = await client.channels.fetch(config.discord_bot.channelId).catch(() => {});
    if (!channel) {
      console.log(
        chalk.red(
          `[CLIENT] ${client.user.tag} | Channel with ID ${config.discord_bot.channelId} was not found.`
        )
      );
      return process.exit(1);
    }
    const msges = await channel.messages.fetch({ limit: 100 });
    const msgs = msges.filter(
      (m) =>
        m.author.id === client.user.id &&
        m.embeds.length > 0 &&
        m.embeds[0].footer.text === `visa2code | Last Update`
    );
    let message;
    if (msgs.size > 0) {
      message = msgs.first();
    } else {
      message = await channel.send({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Yellow)
            .setFooter({ text: `visa2code | Last Update` })
            .setTimestamp()
            .setDescription("Loading..."),
        ],
      });
    }
    const embed = new Discord.EmbedBuilder()
      .setColor(Discord.Colors.Green)
      .setFooter({ text: `visa2code | Last Update` });
    setInterval(() => {
      let all = [];

      client.manager.nodes.forEach((node) => {
        let color;

        if (!node.connected) color = "-";
        else color = "+";

        let info = [];
        info.push(`${color} Node          :: ${node.options.identifier}`);
        info.push(
          `${color} Status        :: ${
            node.connected ? "Connected [🟢]" : "Disconnected [🔴]"
          }`
        );
        info.push(`${color} Player        :: ${node.stats.players}`);
        info.push(`${color} Used Player   :: ${node.stats.playingPlayers}`);
        info.push(
          `${color} Uptime        :: ${moment
            .duration(node.stats.uptime)
            .format(" d [days], h [hours], m [minutes], s [seconds]")}`
        );
        info.push(`${color} Cores         :: ${node.stats.cpu.cores} Core(s)`);
        info.push(
          `${color} Memory Usage  :: ${prettyBytes(
            node.stats.memory.used
          )}/${prettyBytes(node.stats.memory.reservable)}`
        );
        info.push(
          `${color} System Load   :: ${(
            Math.round(node.stats.cpu.systemLoad * 100) / 100
          ).toFixed(2)}%`
        );
        info.push(
          `${color} Lavalink Load :: ${(
            Math.round(node.stats.cpu.lavalinkLoad * 100) / 100
          ).toFixed(2)}%`
        );
        all.push(info.join("\n"));
      });

      const chunked = arrayChunker(all, 8);

      chunked.forEach((data) => {
        embed.setAuthor({
          name: `Lavalink Monitoring`,
          iconURL: client.user.displayAvatarURL({ forceStatic: false }),
        });
        embed.setDescription(`\`\`\`diff\n${data.join("\n\n")}\`\`\``);
        embed.setTimestamp(Date.now());
      });

      message.edit({ embeds: [embed] });
    }, config.discord_bot.refreshInterval);
  });

  client.login(config.discord_bot.token);
}

process.on("unhandledRejection", (error) => {
  console.log(error);
});
process.on("uncaughtException", (error) => {
  console.log(error);
});

function arrayChunker(array, chunkSize = 5) {
  let chunks = [];
  for (let i = 0; i < array.length; i += chunkSize)
    chunks.push(array.slice(i, i + chunkSize));
  return chunks;
}
