import axios from 'axios';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw `Usage: ${usedPrefix}${command} <YouTube Video URL> <resolution>`;
  
  const wait = '🔍 Downloading...';
  m.reply(wait);
  
  const args = text.split(' ');
  const videoUrl = args[0];
  const resolution = args[1] || '480p';

  const apiUrl = `https://your-api.com/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=${resolution}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.url) throw 'Download URL not found in API response.';

    const { title, author, lengthSeconds, views, uploadDate, description, videoUrl, thumbnail, filename } = data;

    const tmpDir = os.tmpdir();
    const filePath = `${tmpDir}/${filename}`;

    const writer = fs.createWriteStream(filePath);
    const downloadResponse = await axios({
      url: data.url,
      method: 'GET',
      responseType: 'stream',
    });

    downloadResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // FFmpeg Check
    const outputFilePath = `${tmpDir}/fixed_${filename}`;
    if (fs.existsSync(filePath)) {
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${filePath}" -c copy "${outputFilePath}"`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    } else {
      throw 'Error: Video file download failed!';
    }

    if (!fs.existsSync(outputFilePath)) throw 'Error: Fixed video file not found!';

    const caption = `📹 *Title*: ${title}
👤 *Author*: ${author}
⏳ *Duration*: ${lengthSeconds} sec
👁️ *Views*: ${views}
📅 *Uploaded*: ${uploadDate}

🔗 *URL*: ${videoUrl}
📝 *Description*: ${description}`;

    await conn.sendMessage(m.chat, {
      video: { url: outputFilePath },
      mimetype: 'video/mp4',
      fileName: filename,
      caption,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: videoUrl,
          title: title,
          body: 'Video Download',
          sourceUrl: videoUrl,
          thumbnail: await (await conn.getFile(thumbnail)).data,
        },
      },
    }, { quoted: m });

    // Delete Temp Files
    fs.unlink(filePath, (err) => err && console.error(`Failed to delete: ${filePath}`));
    fs.unlink(outputFilePath, (err) => err && console.error(`Failed to delete: ${outputFilePath}`));

  } catch (error) {
    console.error(`Error:`, error);
    throw `❌ Error: ${error.message || 'Something went wrong!'}`;
  }
};

handler.help = ['ytmp4'].map((v) => v + ' <URL> <resolution>');
handler.tags = ['downloader'];
handler.command = /^(ytmp4)$/i;

handler.limit = 10;
handler.register = true;
handler.disable = false;

export default handler;
