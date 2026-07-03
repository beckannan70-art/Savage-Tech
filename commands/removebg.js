const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'removebg',
  category: 'tools',
  description: 'Remove background from image (provide image URL or reply to an image)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    let imageUrl = args[0];
    
    if (!imageUrl && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      if (quoted.imageMessage) {
        return await sock.sendMessage(from, { text: '❓ Please reply with a public image URL. Example: .removebg https://example.com/image.jpg' }, { quoted: msg });
      }
    }

    if (!imageUrl || !imageUrl.match(/^https?:\/\/.+\/(.+)/)) {
      return await sock.sendMessage(from, { text: '❓ Provide a valid public image URL.\nUsage: .removebg https://example.com/photo.jpg' }, { quoted: msg });
    }

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/removebg', { image_url: imageUrl }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === true) {
        const result = response.data.result;
        if (result && result.startsWith('data:image')) {
          const base64Data = result.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          await sock.sendMessage(from, { image: buffer, caption: '✅ Background removed.' }, { quoted: msg });
        } else if (result && result.match(/^https?:\/\//)) {
          await sock.sendMessage(from, { text: `🖼️ Background removed: ${result}` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: '⚠️ Unexpected response format.' }, { quoted: msg });
        }
      } else {
        await sock.sendMessage(from, { text: `⚠️ API error: ${response.data.error || 'Remove background failed.'}` }, { quoted: msg });
      }
    } catch (error) {
      console.error('RemoveBG error:', error);
      await sock.sendMessage(from, { text: '❌ Background removal failed. Check URL or API.' }, { quoted: msg });
    }
  }
};
