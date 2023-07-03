const chalk = require("chalk");
const Discord = require("discord.js");
const child_process = require("child_process");
const fs = require("fs");
async function downloadLavalink() {


  console.log(chalk.blue("Downloading Lavalink Stable Build..."));

  const downloadProcess = child_process.spawn("curl", [
    "-L",
    "https://github.com/freyacodes/Lavalink/releases/latest/download/Lavalink.jar",
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
    fs.renameSync("Lavalink.jar", "Lavalink-visa2code.jar");
    console.log(chalk.blue("Starting Lavalink..."));
    const lavalinkProcess = child_process.spawn("java", [
        "-jar",
        "Lavalink-visa2code.jar",
        "-Xmx512m",
        "-Xms512m",
        "-Djdk.tls.client.protocols=TLSv1.2",
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