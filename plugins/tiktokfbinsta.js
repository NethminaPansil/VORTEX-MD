case 'tiktok': 
case 'facebook': 
case 'aio':
case 'instagram': {
    if (!text) return reply(`Give Me A Video Link \n\n*Example:* ${prefix + command} https://www.facebook.com/reel/123456`);
await David.sendMessage(m.chat, { react: { text: `📥`, key: m?.key } });

    try {
        

const apiUrl = `https://api.davidcyriltech.my.id/download/aio?url=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);

        if (response.data.success) {
            const { title, low_quality, high_quality } = response.data.video;

          const isDirectDownloadHD = high_quality.includes("tinyurl");
            const isDirectDownloadSD = low_quality.includes("tinyurl");

            if (isDirectDownloadHD || isDirectDownloadSD) {
if (isDirectDownloadHD) {
                    await David.sendMessage(m.chat, {
                        video: { url: high_quality },
                        mimetype: 'video/mp4',
                        fileName: `${title}_HD.mp4`,
                        caption: `🎥 *Title:* ${title}\n*Quality:* HD\n> ᐯㄖ尺ㄒ乇乂 爪ᗪ`
                    }, { quoted: m });
                }
                if (isDirectDownloadSD) {
                    await David.sendMessage(m.chat, {
                        video: { url: low_quality },
                        mimetype: 'video/mp4',
                        fileName: `${title}_SD.mp4`,
                        caption: `🎥 *Title:* ${title}\n*Quality:* SD\n> ᐯㄖ尺ㄒ乇乂 爪ᗪ`
                    }, { quoted: m });
                }
            } else {
 await David.sendMessage(m.chat, { react: { text: `📥`, key: m?.key } });
   

                const hdBuffer = await axios.get(high_quality, { responseType: 'arraybuffer' });
                const sdBuffer = await axios.get(low_quality, { responseType: 'arraybuffer' });

                if (high_quality) {
                    await David.sendMessage(m.chat, {
                        video: Buffer.from(hdBuffer.data),
                        mimetype: 'video/mp4',
                        fileName: `${title}_HD.mp4`,
                        caption: `🎥 *Title:* ${title}\n*Quality:* HD\n> ᐯㄖ尺ㄒ乇乂 爪ᗪ`
                    }, { quoted: m });
                }
                if (low_quality) {
                    await David.sendMessage(m.chat, {
                        video: Buffer.from(sdBuffer.data),
                        mimetype: 'video/mp4',
                        fileName: `${title}_SD.mp4`,
                        caption: `🎥 *Title:* ${title}\n*Quality:* SD\n> ᐯㄖ尺ㄒ乇乂 爪ᗪ`
                    }, { quoted: m });
                }
            }
        } else {
            reply("❌ Unable to fetch the video. Please check the URL and try again.");
        }
    } catch (error) {
        console.error('Error in AIO Downloader:', error.message);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
    break;
}
