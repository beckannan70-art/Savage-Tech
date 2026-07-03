module.exports = {
    name: "savestatus",
    category: "tools",
    description: "Save a status update (story) and forward it to the bot owner",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: "❌ Reply to a status message (story)." }, { quoted: msg });
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
            return sock.sendMessage(from, { text: "❌ This is not a status message with image/video/audio. Reply to a story." }, { quoted: msg });
        }

        try {
            const buffer = await global.downloadMediaMessage({ message: quoted }, "buffer", {});
            if (!buffer || buffer.length === 0) throw new Error("Download failed");

            // Extract the sender JID from the reply context
            let senderJid = null;
            if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                senderJid = msg.message.extendedTextMessage.contextInfo.participant;
            } else if (quoted.key?.participant) {
                senderJid = quoted.key.participant;
            } else if (quoted.key?.remoteJid && quoted.key.remoteJid !== "status@broadcast") {
                senderJid = quoted.key.remoteJid;
            }

            // Resolve LID to a phone number if possible
            let owner = "Unknown";
            if (senderJid) {
                // If it's a LID, try to resolve it
                if (senderJid.endsWith('@lid') && typeof sock.getJidFromLid === 'function') {
                    try {
                        const resolved = await sock.getJidFromLid(senderJid);
                        if (resolved && !resolved.endsWith('@lid')) {
                            senderJid = resolved;
                        }
                    } catch (_) {}
                }
                owner = senderJid.split('@')[0];
            }

            const caption = `📥 *Status saved*\nFrom: ${owner}\nType: ${mediaType}\n\n_⚡ Powered by Savage Tech_`;

            const ownerJid = global.ownerJid;
            if (ownerJid) {
                if (mediaType === "image") {
                    await sock.sendMessage(ownerJid, { image: buffer, caption: caption });
                } else if (mediaType === "video") {
                    await sock.sendMessage(ownerJid, { video: buffer, caption: caption });
                } else if (mediaType === "audio") {
                    await sock.sendMessage(ownerJid, { audio: buffer, mimetype: 'audio/mpeg', caption: caption });
                }
                await sock.sendMessage(from, { text: `✅ Status saved and forwarded to the owner.` }, { quoted: msg });
            } else {
                if (mediaType === "image") {
                    await sock.sendMessage(from, { image: buffer, caption: caption }, { quoted: msg });
                } else if (mediaType === "video") {
                    await sock.sendMessage(from, { video: buffer, caption: caption }, { quoted: msg });
                } else if (mediaType === "audio") {
                    await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg', caption: caption }, { quoted: msg });
                }
                await sock.sendMessage(from, { text: `⚠️ No owner registered. Status sent to you instead.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("savestatus error:", err);
            await sock.sendMessage(from, { text: `❌ Failed to save status: ${err.message}` }, { quoted: msg });
        }
    }
};
