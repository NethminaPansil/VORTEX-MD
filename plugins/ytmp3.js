const config = require('../config');
const { cmd, commands } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: "ytmp3",
  category: "downloader",
  react: "🎵",
  desc: "Download YouTube audios as MP3",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    // Ensure a URL is provided
    if (!q) return await reply('Please provide a YouTube audio URL.');

    const url = encodeURIComponent(q);
    
    // Fetch audio details from the API
    const response = await fetch(`https://dark-shan-yt.koyeb.app/download/ytmp3?url=${url}`);
    const data = await response.json();

    // Check if the data response is valid
    if (!data.status || !data.data) {
      return await reply('Failed to fetch audio details. Please check the URL and try again.');
    }

    const audio = data.data;

    // Create message with audio details
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
