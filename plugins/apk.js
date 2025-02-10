module.exports = {
    name: "apk",  // Command Name
    execute: async (m, { text, conn, reply, prefix, command }) => {
        if (!text) return reply(`*Usage:* ${prefix + command} <app name>`);

        try {
            await reply('🔍 *Searching for APK...*');

            const apiUrl = `https://api.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);

            if (!response.data.success) {
                return reply('❌ *Failed to fetch APK. Try again later.*');
            }

            const { apk_name, thumbnail, download_link } = response.data;

            await conn.sendMessage(m.chat, { 
                image: { url: thumbnail },
                caption: `📥 *APK Downloader* 📥\n\n📌 *Name:* ${apk_name}\n🔗 *Downloading APK...*`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { 
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
