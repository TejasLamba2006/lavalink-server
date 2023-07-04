module.exports = {
    discord_bot: {
        enabled: true,
        token: process.env.TOKEN || "",
        prefix: process.env.PREFIX || "!",
        activity: {
            name: process.env.ACTIVITY_NAME || "Music",
            type: process.env.ACTIVITY_TYPE || "LISTENING",
        },
        channelId: process.env.CHANNEL_ID || ""
    },
    lavalink: {
        enabled: true,
        nodes: [{
            host: process.env.LAVALINK_HOST || "localhost",
            port: process.env.LAVALINK_PORT || 443,
            password: process.env.LAVALINK_PASSWORD || "youshallnotpass",
            secure: process.env.LAVALINK_SECURE || true
        }],
        retryDelay: 5000,
        retryAmount: 10,
        send: function (guildID, packet) {
            const guild = this.client.guilds.cache.get(guildID);
            if (guild) guild.shard.send(packet);
        },
    }
}