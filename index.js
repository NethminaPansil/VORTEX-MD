const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const express = require("express");
const config = require('./config');
const { sms, downloadMediaMessage } = require('./lib/msg');
const fetch = require('node-fetch');
const qrcode = require('qrcode-terminal');
const { cmd, commands } = require('./command');
const app = express();
const port = process.env.PORT || 8000;
const { MegaNz } = require('mega-nz'); // Import MegaNz

// Mega.nz credentials (REMOVE AFTER SESSION DOWNLOAD)
const megaEmail = 'your_mega_email@example.com'; 
const megaPassword = 'your_mega_password';

//===================SESSION-AUTH============================
async function downloadSession() {
    return new Promise((resolve, reject) => {
        const mega = new MegaNz({ email: megaEmail, password: megaPassword });

        if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
            if (!config.SESSION_ID) {
                console.log('Please add your session to SESSION_ID env !!');
                reject("No SESSION_ID provided.");
                return;
            }
            const sessdata = config.SESSION_ID;

            mega.getFile(`${sessdata}`).then(file => {
                file.download(`./auth_info_baileys/creds.json`, (err) => {
                    if (err) {
                        console.error("Error downloading session:", err);
                        reject(err);
                        return;
                    }
                    console.log("Session downloaded ...");
                    resolve();
                });
            }).catch(error => {
                console.error("Error getting file info:", error);
                reject(error);
            });
        } else {
            resolve(); // Session file exists
        }
    });
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
        console.error("Error in alive command:", e);
        reply(`Error: ${e.message}`);
    }
});

// ytmp3 Command
cmd({
    pattern: "ytmp3",
    category: "downloader",
    react: "",
    desc: "Download YouTube audios as MP3",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return await reply('Please provide a YouTube audio URL.');

        const url = encodeURIComponent(q);
        const response = await fetch(`https://dark-shan-yt.koyeb.app/download/ytmp3?url=${url}`);

        if (!response.ok) {
            const errorText = await response.text(); // Get error details from response
            return reply(`Failed to fetch audio details. Status: ${response.status} - ${response.statusText}.  Details: ${errorText}`);
        }

        const data = await response.json();

        if (!data.status || !data.data) {
            return await reply('Failed to fetch audio details. Please check the URL and try again.');
        }

        const audio = data.data;
        const message = `
 𝗩𝗢𝗥𝗧𝗘𝗫 𝗠𝗗 𝐒𝐎𝐍𝐆 𝐃𝐎ＷＮＬＯＡＤ 

╭━━━━━━━━━●●►
┢❑ 𝐓𝐢𝐭𝐥𝐞: ${audio.title}
┢❑ 𝐅𝐨𝐫𝐦𝐚𝐭: ${audio.format}
┢❑ 𝐓𝐢𝐦𝐞: ${audio.timestump || 'N/A'}
┢❑ 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${audio.ago || 'N/A'}
┢❑ 𝐕𝐢𝐞𝐰𝐬: ${audio.views || 'N/A'}
┢❑ 𝐋𝐢𝐤𝐞𝐬: ${audio.likes || 'N/A'}
╰━━━━━━━━●●►
        `;

        await conn.sendMessage(from, {
            image: { url: audio.thumbnail },
            caption: message,
            document: { url: audio.download },
            mimetype: 'audio/mp3',
            fileName: `${audio.title}.mp3`
        }, { quoted: mek }); // Reply with quote

    } catch (e) {
        console.error("Error in ytmp3 command:", e);
        await reply(` An error occurred: ${e.message || e}`);
    }
});


// Connect to WhatsApp
async function connectToWA() {
  try {
    await downloadSession(); // Wait for session to download

    console.log("Connecting to WhatsApp...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true, // QR code terminal එකේ පෙන්නන්න
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connected successfully!');
            conn.sendMessage(config.ownerNumber + "@s.whatsapp.net", { text: "VORTEXMD Connected " });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
      // ... (rest of the message handling code remains the same)
    });

  } catch (error) {
