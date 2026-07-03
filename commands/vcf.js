module.exports = {
    category: 'group',
    name: 'vcf',
    description: 'Export group contacts into VCF',

    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, {
                text: '❎ This command can only be used inside groups.'
            }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        let isAdmin = false;
        try {
            const metadata = await sock.groupMetadata(from);
            const participant = metadata.participants.find(p => p.id === sender || p.jid === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (err) {
            console.log(err);
        }

        if (!isAdmin && !isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, {
                text: '❎ You are not worthy of this command.'
            }, { quoted: msg });
        }

        await sock.sendMessage(from, {
            text: '📡 Collecting group members...'
        }, { quoted: msg });

        try {
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants || [];

            if (!participants.length) {
                return await sock.sendMessage(from, {
                    text: '⚠️ Group members could not be loaded.'
                }, { quoted: msg });
            }

            const contacts = [];
            const cache = new Set();

            for (const participant of participants) {
                const jid = participant.jid || participant.id || '';
                if (!jid) continue;

                let number = jid.split('@')[0];
                if (number.includes(':')) number = number.split(':')[0];
                number = number.replace(/\D/g, '');

                if (!number || number.length < 7) continue;
                if (cache.has(number)) continue;
                cache.add(number);

                contacts.push({
                    name: 'Savage Tech',
                    phone: `+${number}`
                });
            }

            if (!contacts.length) {
                return await sock.sendMessage(from, {
                    text: '❌ No exportable contacts found.'
                }, { quoted: msg });
            }

            let vcfData = '';
            for (const user of contacts) {
                vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nTEL;TYPE=CELL:${user.phone}\nEND:VCARD\n\n`;
            }

            const fileBuffer = Buffer.from(vcfData, 'utf-8');
            const preview = contacts.slice(0, 30);
            const message =
                `╭━━━〔 📇 VCF EXPORT 〕━━━⬣\n` +
                `┃ 👥 Contacts : ${contacts.length}\n` +
                `┃ 📦 Format   : VCF\n` +
                `┃ 🏷️ Group    : ${metadata.subject}\n` +
                `╰━━━━━━━━━━━━━━━━⬣\n\n` +
                `📜 *Preview Contacts*\n\n\`\`\`json\n${JSON.stringify(preview, null, 2)}\n\`\`\`\n\n_...and ${contacts.length - preview.length} more_`;

            await sock.sendMessage(from, {
                document: fileBuffer,
                mimetype: 'text/vcard',
                fileName: `${metadata.subject}_SavageTech.vcf`,
                caption: message
            }, { quoted: msg });

        } catch (err) {
            console.log(err);
            await sock.sendMessage(from, {
                text: `❌ Failed to generate VCF file.\n\nReason: ${err.message}`
            }, { quoted: msg });
        }
    }
};
