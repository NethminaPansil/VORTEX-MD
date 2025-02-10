const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');
const prefix = '.';

const ownerNumber = ['94763513529'];

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("Session downloaded 💝…");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

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

async function connectToWA() {
    console.log("Connecting to WhatsApp...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    var { version } = await fetchLatestBaileysVersion();

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
            conn.sendMessage(ownerNumber + "@s.whatsapp.net", { text: "VORTEXMD Connected 💝" });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;

        const m = sms(conn, mek);
        const body = m.body || '';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';

        if (plugins[command]) {
            try {
                await plugins[command].execute(m, { 
                    text: m.q, 
                    conn, 
                    reply: (msg) => conn.sendMessage(m.chat, { text: msg }, { quoted: m }), 
                    prefix, 
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
