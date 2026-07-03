const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'geoip',
  category: 'ethical hacking',
  description: 'IP geolocation lookup',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const ip = args[0];
    if (!ip) return sock.sendMessage(from, { text: '❓ Usage: .geoip <IP>' }, { quoted: msg });

    try {
      await sock.sendMessage(from, { text: `🌍 Locating IP ${ip}...` }, { quoted: msg });
      const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,isp,org,as`, { httpsAgent: agent });
      if (res.data.status === 'fail') throw new Error(res.data.message);
      const d = res.data;
      let text = `📍 Geolocation for ${ip}\n`;
      text += `Country: ${d.country}\nRegion: ${d.regionName}\nCity: ${d.city}\n`;
      text += `ZIP: ${d.zip}\nCoordinates: ${d.lat}, ${d.lon}\nISP: ${d.isp}\nOrganization: ${d.org}\nAS: ${d.as}`;
      await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ GeoIP error: ${err.message}` }, { quoted: msg });
    }
  }
};
