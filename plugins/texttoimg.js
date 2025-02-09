case 'txt2img': {
  if(!q) return m.reply('give me a prompt');
  m.reply('_Wet. . ._');
  try {
    const url = `https://api.ryzendesu.vip/api/ai/v2/text2img?prompt=${encodeURIComponent(q)}&model=flux_dev`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    conn.sendMessage(from, {
      image: Buffer.from(response.data),
      caption: 'Success✅'
    }, {quoted: mek})
  } catch (error) {
    console.log(error);
    await m.reply('error')
  }
}
break
