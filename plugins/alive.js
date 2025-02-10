const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Bot status image and message
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const aliveMessage = `${config.ALIVE_MSG}\n\n` +
            `*Uptime*: ${hours}h ${minutes}m ${seconds}s\n` +
            `*Memory Usage*: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB\n` +
            `*Node.js Version*: ${process.version}\n` +
            `*Platform*: ${process.platform}`;

        return await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },  // Image URL
            caption: aliveMessage,  // Status Message
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});
