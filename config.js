module.exports = {
    discord_bot: {
        enabled: true,
        token: process.env.TOKEN || "",
        activity: {
            name: process.env.ACTIVITY_NAME || "Lavalinks",
            type: process.env.ACTIVITY_TYPE || "Watching",
        },
        channelId: process.env.CHANNEL_ID || "",
        refreshInterval: process.env.REFRESH_INTERVAL || 30000,
    },
    lavalink: {
        enabled: false,
        nodes: [{
            host: process.env.LAVALINK_HOST || "",
            port: process.env.LAVALINK_PORT || 443,
            password: process.env.LAVALINK_PASSWORD || "visa2code",
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