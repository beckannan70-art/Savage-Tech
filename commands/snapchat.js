const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent: httpsAgent }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'snapchat',
  category: 'download',
  description: 'Download from snapchat',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const url = args[0];
    if (!url) return await sock.sendMessage(from, { text: '❓ Usage: .snapchat <URL>' }, { quoted: msg });
    if (!url.startsWith('http')) return await sock.sendMessage(from, { text: '❌ Provide a valid URL starting with http:// or https://' }, { quoted: msg });

    try {
      const apiUrl = `https://apis.xwolf.space/download/snapchat?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent });
      const data = response.data;

      if (!data.success) throw new Error(data.error || 'Download failed');

      const isVideo = true; // snapchat is always video
      const isAudio = false;
      const isText = false;

      if (isText) {
        let text = `📁 *Download Info (snapchat)*\n\n`;
        if (data.result) text += data.result;
        else if (data.info) text += JSON.stringify(data.info, null, 2);
        else text += JSON.stringify(data, null, 2);
        await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
        return;
      }

      let downloadUrl = null;
      if (data.downloadUrl) downloadUrl = data.downloadUrl;
      else if (data.result && typeof data.result === 'string') downloadUrl = data.result;
      else if (data.url) downloadUrl = data.url;
      else if (data.media && data.media.url) downloadUrl = data.media.url;
      else if (data.video && data.video.url) downloadUrl = data.video.url;
      else if (data.audio && data.audio.url) downloadUrl = data.audio.url;
      else if (Array.isArray(data.result) && data.result.length > 0) {
        const best = data.result.find(r => r.quality === 'HD') || data.result[0];
        downloadUrl = best.url || best.downloadUrl;
      }
      if (!downloadUrl) throw new Error('No download link found in API response');

      const fileBuffer = await downloadFile(downloadUrl);
      const maxSize = isVideo ? 64 * 1024 * 1024 : 16 * 1024 * 1024;
      if (fileBuffer.length > maxSize) {
        await sock.sendMessage(from, { text: `⚠️ File too large (${(fileBuffer.length/1024/1024).toFixed(1)}MB). Direct link: ${downloadUrl}` }, { quoted: msg });
        return;
      }

      const caption = `📥 *Download: snapchat*`;
      if (isVideo) {
        await sock.sendMessage(from, { video: fileBuffer, caption: caption }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { audio: fileBuffer, mimetype: 'audio/mpeg', fileName: 'download.mp3', caption: caption }, { quoted: msg });
      }
    } catch (err) {
      console.error('snapchat error:', err);
      await sock.sendMessage(from, { text: `❌ Download failed.\n${err.message}` }, { quoted: msg });
    }
  }
};
