const { cmd, commands } = require('../command');
const fg = require('api-dylux');
const yts = require('yt-search');

cmd({
    pattern: "song",
    desc: "Download songs",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return reply("Please provide a song title or YouTube URL.");

        const search = await yts(q);
        if (!search.videos.length) return reply("No results found!");

        const data = search.videos[0];
        const url = data.url;

        let desc = `
💝 *VORTEXMD Song Downloader* 💝

🎵 *Title:* ${data.title}
📄 *Description:* ${data.description}
⏳ *Duration:* ${data.timestamp}
📅 *Uploaded:* ${data.ago}
👁️ *Views:* ${data.views}

Made By 🍂 Pansilu Nethmina 🍂
`;

        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

        // Download audio
        let down = await fg.yta(url);
        console.log(down); // Debugging

        if (!down || !down.dl_url) return reply("Failed to get the download link.");

        let downloadurl = down.dl_url;

        // Send audio message
        await conn.sendMessage(from, { audio: { url: downloadurl }, mimetype: "audio/mpeg" }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`Error: ${e.message}`);
    }
});
