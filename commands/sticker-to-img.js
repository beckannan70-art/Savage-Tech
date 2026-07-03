const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
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

async function getMediaBufferFromMessage(sock, msg) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return null;

  let mediaType = null;
  let mediaMsg = null;

  if (quoted.imageMessage) {
    mediaType = 'image';
    mediaMsg = quoted.imageMessage;
  } else if (quoted.videoMessage) {
    mediaType = 'video';
    mediaMsg = quoted.videoMessage;
  } else if (quoted.stickerMessage) {
    mediaType = 'sticker';
    mediaMsg = quoted.stickerMessage;
  }

  if (!mediaMsg) return null;

  const stream = await sock.downloadMediaMessage({ message: { [mediaType + 'Message']: mediaMsg } });
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

module.exports = {
  name: 'sticker-to-img',
  category: 'tools',
  description: 'Convert media using sticker-to-img (reply to image/video/sticker OR provide URL)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    let mediaBuffer = null;
    let providedUrl = args[0];

    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      mediaBuffer = await getMediaBufferFromMessage(sock, msg);
    }

    if (!mediaBuffer && !providedUrl) {
      return await sock.sendMessage(from, {
        text: '❓ Usage: .sticker-to-img\n   - Reply to an image/video/sticker\n   - Or provide a direct URL: .sticker-to-img https://example.com/media.jpg'
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(from, { text: '🔄 Converting media...' }, { quoted: msg });

      let apiUrl;
      if (mediaBuffer) {
        const base64 = mediaBuffer.toString('base64');
        const mime = (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.mimetype) ||
                     (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.mimetype) ||
                     'application/octet-stream';
        const dataUrl = `data:${mime};base64,${base64}`;
        apiUrl = `https://apis.xwolf.space/api/converter/sticker-to-img?url=${encodeURIComponent(dataUrl)}`;
      } else {
        apiUrl = `https://apis.xwolf.space/api/converter/sticker-to-img?url=${encodeURIComponent(providedUrl)}`;
      }

      const response = await axios.get(apiUrl, { agent, responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      const resultBuffer = Buffer.from(response.data);

      const caption = '✅ *Converted via sticker-to-img*';

      if (contentType.includes('video')) {
        await sock.sendMessage(from, { video: resultBuffer, caption: caption }, { quoted: msg });
      } else if (contentType.includes('image') || contentType.includes('webp')) {
        await sock.sendMessage(from, { image: resultBuffer, caption: caption }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: caption + '\n\n' + resultBuffer.toString('utf-8').slice(0, 500) }, { quoted: msg });
      }
    } catch (err) {
      console.error('sticker-to-img error:', err);
      await sock.sendMessage(from, { text: `❌ Conversion failed: ${err.message}` }, { quoted: msg });
    }
  }
};
