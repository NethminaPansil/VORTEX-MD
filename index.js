const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const express = require("express");
const config = require('./config'); // Load config from environment variables
const { sms, downloadMediaMessage } = require('./lib/msg');
const fetch = require('node-fetch');  // Ensure node-fetch is installed for HTTP requests
const axios = require('axios');  // Ensure axios is installed
const qrcode = require('qrcode-terminal');
const { cmd, commands } = require('./command');
const app = express();
const port = process.env.PORT || 8000;

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID;
    // Ensure to replace with actual file download method
    fetch(`https://mega.nz/file/${sessdata}`)
      .then(response => response.json())
      .then(data => {
        fs.writeFileSync(__dirname + '/auth_info_baileys/creds.json', JSON.stringify(data));
        console.log("Session downloaded 💝...");
      })
      .catch(error => console.error("Error downloading session:", error));
}

//=============================================
// Plugin Loader
const plugins = {};

fs.readdirSync("./plugins/").forEach((file) => {
    if (file.endsWith('.js')) {
        const plugin = require("./plugins/" + file);
        if (plugin.name) {
            plugins[plugin.name] = plugin;
        }
    }
});

console.log("✅ Plugins loaded successfully!");

//=============================================
// Bot Command Handlers

// Alive Command
cmd({
    pattern: "alive",
    category: "main",
    react: "✅",
    desc: "Check bot online or not.",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: config.ALIVE_IMG }, caption: config.ALIVE_MSG }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});

// ytmp3 Command - Download YouTube audio as MP3
cmd({
    pattern: "ytmp3",
    category: "downloader",
    react: "🎶",
    desc: "Download YouTube audios as MP3",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return await reply('Please provide a YouTube audio URL.');

        const url = encodeURIComponent(q);
        const response = await fetch(`https://dark-shan-yt.koyeb.app/download/ytmp3?url=${url}`);
        const data = await response.json();

        if (!data.status || !data.data) {
            return await reply('Failed to fetch audio details. Please check the URL and try again.');
        }

        const audio = data.data;
        const message = `
💝 𝗩𝗢𝗥𝗧𝗘𝗫 𝗠𝗗 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 💝

╭━━━━━━━━━●●►
┢❑ 𝐓𝐢𝐭𝐥𝐞: ${audio.title}
┢❑ 𝐅𝐨𝐫𝐦𝐚𝐭: ${audio.format}
┢❑ 𝐓𝐢𝐦𝐞: ${audio.timestump || 'N/A'}
┢❑ 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${audio.ago || 'N/A'}
┢❑ 𝐕𝐢𝐞𝐰𝐬: ${audio.views || 'N/A'}
┢❑ 𝐋𝐢𝐤𝐞𝐬: ${audio.likes || 'N/A'}
╰━━━━━━━━●●►
    `;

    // Send thumbnail with message
    await conn.sendMessage(from, {
      image: { url: audio.thumbnail },
      caption: message
    });

    // Send the audio file
    await conn.sendMessage(from, {
      document: { url: audio.download },
      mimetype: 'audio/mp3',
      fileName: `${audio.title}.mp3`,
      caption: `🎶 Downloading: ${audio.title}`
    });

    // Send confirmation react
    await conn.sendMessage(from, {
      react: { text: '✅', key: mek.key }
    });

  } catch (e) {
    console.error(e);
    await reply(`📕 An error occurred: ${e.message || e}`);
  }
});

// Connect to WhatsApp
async function connectToWA() {
    console.log("Connecting to WhatsApp...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connected successfully!');
            conn.sendMessage(config.ownerNumber + "@s.whatsapp.net", { text: "VORTEXMD Connected 💝" });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;

        const m = sms(conn, mek);
        const body = m.body || '';
        const isCmd = body.startsWith('.');
        const command = isCmd ? body.slice(1).trim().split(' ').shift().toLowerCase() : '';

        if (plugins[command]) {
            try {
                await plugins[command].execute(m, { 
                    text: m.q, 
                    conn, 
                    reply: (msg) => conn.sendMessage(m.chat, { text: msg }, { quoted: m }), 
                    prefix: '.', 
                    command 
                });
            } catch (error) {
                console.error(`❌ Error in ${command} plugin:`, error);
                reply('⚠️ An error occurred while executing the command.');
            }
        }
    });
}

app.get("/", (req, res) => {
    res.send("Bot is Running...");
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

setTimeout(() => {
    connectToWA();
}, 4000);
