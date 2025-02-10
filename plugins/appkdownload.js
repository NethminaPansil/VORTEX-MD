const axios = require('axios');

module.exports = {
    name: 'apk',
    alias: ['apkdl'],
    category: 'downloader',
    desc: 'Download APK file from API',
    async execute(m, { text, David, reply, prefix, command }) {
        if (!text) return reply(`*Example:* ${prefix + command} WhatsApp`);

        try {
            await reply('🔍 *Searching for APK...*');

            const apiUrl = `https://api.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);

            if (!response || !response.data || !response.data.success) {
                return reply('❌ *Failed to fetch APK. Try again later.*');
            }

            const { apk_name, thumbnail, download_link } = response.data || {};

            if (!apk_name || !download_link) {
                return reply('❌ *Failed to fetch APK. Try again later.*');
            }

            const imageUrl = thumbnail || 'https://example.com/default-thumbnail.jpg';

            await David.sendMessage(m.chat, { 
                image: { url: imageUrl },
                caption: `📥 *APK Downloader* 📥\n\n` +
                         `📌 *Name:* ${apk_name}\n\n` +
                         `🔗 *Downloading APK...*\n\n` +
                         `> ᐯㄖ尺ㄒ乇乂 爪ᗪ`
            }, { quoted: m });

            if (!download_link.startsWith('http')) {
                return reply('❌ *Invalid download link received. Try again later.*');
            }

            await David.sendMessage(m.chat, { 
                document: { url: download_link }, 
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${apk_name}.apk`
            }, { quoted: m });

        } catch (error) {
            console.error('Error in APK Downloader:', error);
            reply('❌ *Failed to fetch APK. Try again later.*');
        }
    }
};
