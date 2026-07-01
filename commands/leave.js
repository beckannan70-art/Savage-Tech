module.exports = {
    name: "leave",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        const humanQuotes = [
            "Alright, I'm out. Y'all behave... or don't, I won't be watching.",
            "Leaving before I say something I'll regret. Bye.",
            "This place was fun until it wasn't. Later.",
            "I'll see myself out. No hard feelings.",
            "Peace. I've got better groups to haunt.",
            "Don't miss me too much. Actually, do. It feeds my ego.",
            "I'm taking my sarcasm elsewhere. Good luck.",
            "Bye. Try not to break the group without me.",
            "Exiting stage left. Cue the dramatic music.",
            "I've seen enough. Time to disappear."
        ];
        const quote = humanQuotes[Math.floor(Math.random() * humanQuotes.length)];

        const isGroup = from.endsWith("@g.us");
        let target = from;
        let isSpecific = false;
        if (args[0] && args[0] !== "this") {
            let jid = args[0];
            if (!jid.includes("@")) jid += "@g.us";
            if (jid.endsWith("@g.us")) {
                target = jid;
                isSpecific = true;
            } else {
                return await sock.sendMessage(from, { text: "❌ Invalid group JID." }, { quoted: msg });
            }
        } else if (!isGroup) {
            return await sock.sendMessage(from, { text: "❌ This is not a group. Use `.leave <groupJID>` or `.leave this` in a group." }, { quoted: msg });
        }

        try {
            if (!isSpecific || target === from) {
                await sock.sendMessage(target, { text: `👋 ${quote}` });
            }
            await sock.groupLeave(target);
            if (isSpecific && from !== target) {
                await sock.sendMessage(from, { text: `✅ Left group ${target}\n\n${quote}` }, { quoted: msg });
            } else if (from !== target) {
                await sock.sendMessage(from, { text: `✅ Left this group.\n\n${quote}` }, { quoted: msg });
            }
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Failed to leave: ${err.message}` }, { quoted: msg });
        }
    }
};
