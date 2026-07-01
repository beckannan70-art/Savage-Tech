global.warns = global.warns || {};

module.exports = {
    name: "warn",
    category: "group",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith("@g.us")) {
            return await sock.sendMessage(from, {
                text: "❌ Group only command."
            }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;

        let isAdmin = false;

        try {
            const meta = await sock.groupMetadata(from);

            const participant = meta.participants.find(
                p => p.id === sender || p.jid === sender
            );

            isAdmin =
                participant?.admin === "admin" ||
                participant?.admin === "superadmin";

        } catch {}

        if (!isAdmin && !isArchitect && !isMe) {
            return await sock.sendMessage(from, {
                text: "❎ You are not worthy of this command."
            }, { quoted: msg });
        }

        let mentioned =
            msg.message?.extendedTextMessage
                ?.contextInfo
                ?.mentionedJid?.[0];

        if (!mentioned) {
            mentioned =
                msg.message?.extendedTextMessage
                    ?.contextInfo
                    ?.participant;
        }

        if (!mentioned) {
            return await sock.sendMessage(from, {
                text:
`⚠️ Reply to a message or mention a user.

Example:
.warn @user spam

OR
Reply:
.warn spam`
            }, { quoted: msg });
        }

        if (global.owner?.includes(mentioned)) {
            return await sock.sendMessage(from, {
                text: "⚡ You cannot warn the creator of Savage Tech."
            }, { quoted: msg });
        }

        const reason = mentioned
            ? args.slice(1).join(" ") || "No reason provided"
            : args.join(" ") || "No reason provided";

        if (!global.warns[from]) global.warns[from] = {};
        if (!global.warns[from][mentioned]) global.warns[from][mentioned] = 0;

        global.warns[from][mentioned]++;

        const warns = global.warns[from][mentioned];
        const remaining = 3 - warns;

        const quotes = [
            "Spencer's patience decreases with every mistake.",
            "Rules exist for a reason. You ignored them.",
            "Another violation added to your record.",
            "Savage Tech sees everything.",
            "You're approaching removal territory.",
            "Discipline is enforced here, not requested.",
            "You were warned. The system remembers.",
            "Chaos is temporary. Enforcement is permanent.",
            "Every action has consequences in this group.",
            "You are testing a system designed to win."
        ];

        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        if (warns >= 3) {

            delete global.warns[from][mentioned];

            await sock.sendMessage(from, {
                text:
`☠️ *FINAL WARNING EXCEEDED*

👤 User: @${mentioned.split("@")[0]}
📌 Reason: ${reason}

📊 Warnings: 3/3
🚫 Action: Removal Initiated

🧊 ${quote}

⚡ Powered by Savage Tech`,
                mentions: [mentioned]
            }, { quoted: msg });

            try {
                await sock.groupParticipantsUpdate(from, [mentioned], "remove");
            } catch (err) {
                console.log(err);
            }

            return;
        }

        await sock.sendMessage(from, {
            text:
`⚠️ *WARNING ISSUED*

👤 User: @${mentioned.split("@")[0]}
📌 Reason: ${reason}

📊 Warnings: ${warns}/3
⏳ Remaining Before Kick: ${remaining}

🧊 ${quote}

⚡ Powered by Savage Tech`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
