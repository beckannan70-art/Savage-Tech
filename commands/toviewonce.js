const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "toviewonce",
    category: "tools",
    description: "Convert a replied image/video/audio into a view‑once message",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: "❌ Reply to an image, video, or audio." }, { quoted: msg });
        }

        let mediaType = null;
        let mediaMsg = null;
        if (quoted.imageMessage) {
            mediaType = "image";
            mediaMsg = quoted.imageMessage;
        } else if (quoted.videoMessage) {
            mediaType = "video";
            mediaMsg = quoted.videoMessage;
        } else if (quoted.audioMessage) {
            mediaType = "audio";
            mediaMsg = quoted.audioMessage;
        } else {
            return sock.sendMessage(from, { text: "❌ Only images, videos, and audio can be converted to view‑once." }, { quoted: msg });
        }

        try {
            const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
            if (!buffer) throw new Error("Download failed");

            const sendObj = {
                [mediaType]: buffer,
                viewOnce: true,
                caption: mediaMsg.caption || (mediaType === "audio" ? "View‑once audio" : "View‑once message")
            };

            if (mediaType === "audio") {
                sendObj.mimetype = mediaMsg.mimetype || "audio/mpeg";
                sendObj.fileName = mediaMsg.fileName || "audio.mp3";
            }

            await sock.sendMessage(from, sendObj, { quoted: msg });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ Failed to convert: " + err.message }, { quoted: msg });
        }
    }
};
