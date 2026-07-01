const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'statusConfig.json');
const DEFAULT_CONFIG = {
    enabled: true,
    viewMode: 'view+react',
    mode: 'random',
    fixedEmoji: '⚡',
    reactions: ['⚡', '❤️', '👍', '🔥', '🎉', '😂', '😮', '👏', '🎯', '💯', '🌟', '✨', '💥', '🫶'],
    cycleIndex: 0,
    excludedContacts: [],
    totalReacted: 0,
    reactedStatuses: []
};

let config = null;
let reactedSet = new Set();

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            config = { ...DEFAULT_CONFIG, ...data };
        } else {
            config = { ...DEFAULT_CONFIG };
            saveConfig();
        }
        reactedSet = new Set(config.reactedStatuses || []);
    } catch {
        config = { ...DEFAULT_CONFIG };
        saveConfig();
    }
}

function saveConfig() {
    try {
        config.reactedStatuses = Array.from(reactedSet);
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch {}
}

function getReaction() {
    if (config.mode === 'fixed') return config.fixedEmoji;
    if (!config.reactions.length) return '⚡';
    if (config.mode === 'cycle') {
        const emoji = config.reactions[config.cycleIndex % config.reactions.length];
        config.cycleIndex = (config.cycleIndex + 1) % config.reactions.length;
        saveConfig();
        return emoji;
    }
    return config.reactions[Math.floor(Math.random() * config.reactions.length)];
}

function isExcluded(jid) {
    const num = jid?.split('@')[0]?.split(':')[0] || '';
    return config.excludedContacts.includes(num);
}

function hasReacted(statusKey) {
    const key = `${statusKey.participant || statusKey.remoteJid}|${statusKey.id}`;
    for (const k of reactedSet) {
        if (k.startsWith(key)) return true;
    }
    return false;
}

function markReacted(statusKey) {
    const key = `${statusKey.participant || statusKey.remoteJid}|${statusKey.id}|${Date.now()}`;
    reactedSet.add(key);
    if (reactedSet.size > 500) {
        const arr = Array.from(reactedSet);
        reactedSet = new Set(arr.slice(-250));
    }
    saveConfig();
}

function addLog(sender, reaction, statusId) {
    config.totalReacted = (config.totalReacted || 0) + 1;
    saveConfig();
}

loadConfig();

module.exports = {
    name: 'autoreactstatus',
    category: 'engine',
    description: 'Auto-react to WhatsApp statuses',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = global.ownerJid && sender === global.ownerJid;
        const isSudo = global.sudoers && Array.isArray(global.sudoers) && global.sudoers.includes(sender);
        const isAuthorized = isArchitect || isOwner || isSudo;

        const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

        if (!args || args.length === 0) {
            const status = config.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE';
            const modeLabel = config.mode === 'fixed' ? `FIXED (${config.fixedEmoji})` :
                              config.mode === 'cycle' ? `CYCLE (pos ${config.cycleIndex + 1}/${config.reactions.length})` :
                              'RANDOM';
            const viewLabel = config.viewMode === 'view+react' ? '👁️+⚡ View + React' : '⚡ React only';
            let text = `╭─⌈ ⚡ *AUTOREACT STATUS* ⌋\n│\n`;
            text += `├ Status    : ${status}\n`;
            text += `├ View Mode : ${viewLabel}\n`;
            text += `├ Emoji Mode: ${modeLabel}\n`;
            text += `├ Total     : ${config.totalReacted || 0}\n`;
            text += `├ Excluded  : ${config.excludedContacts.length}\n`;
            text += `├ Tracked   : ${reactedSet.size}\n`;
            text += `│\n`;
            text += `├─⊷ *${global.prefix}autoreact on* — Enable\n`;
            text += `├─⊷ *${global.prefix}autoreact off* — Disable\n`;
            text += `├─⊷ *${global.prefix}autoreact view* — View+React mode\n`;
            text += `├─⊷ *${global.prefix}autoreact react* — React only\n`;
            text += `├─⊷ *${global.prefix}autoreact random* — Random emoji\n`;
            text += `├─⊷ *${global.prefix}autoreact fixed ⚡* — Fixed emoji\n`;
            text += `├─⊷ *${global.prefix}autoreact cycle* — Cycle emojis\n`;
            text += `├─⊷ *${global.prefix}autoreact exclude 2547xxxx* — Skip a contact\n`;
            text += `├─⊷ *${global.prefix}autoreact include 2547xxxx* — Unskip\n`;
            text += `├─⊷ *${global.prefix}autoreact excluded* — Show skip list\n`;
            text += `├─⊷ *${global.prefix}autoreact stats* — Statistics\n`;
            text += `╰⊷ *Powered by SAVAGE-TECH*`;
            await reply(text);
            return;
        }

        if (!isAuthorized) {
            await reply('❌ Only owner and sudo users can configure auto-react.');
            return;
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'on':
            case 'enable':
                config.enabled = true;
                saveConfig();
                await reply(`✅ *AUTOREACT ENABLED*\n\n⚡ Will ${config.viewMode === 'view+react' ? 'view then react to' : 'react to'} all statuses.`);
                break;

            case 'off':
            case 'disable':
                config.enabled = false;
                saveConfig();
                await reply(`❌ *AUTOREACT DISABLED*`);
                break;

            case 'view':
                config.viewMode = 'view+react';
                saveConfig();
                await reply(`👁️+⚡ *VIEW+REACT MODE*\n\nWill view the status first, then react.`);
                break;

            case 'react':
                config.viewMode = 'react-only';
                saveConfig();
                await reply(`⚡ *REACT-ONLY MODE*\n\nWill react without marking as viewed.`);
                break;

            case 'random':
                config.mode = 'random';
                saveConfig();
                await reply(`🎲 *RANDOM MODE*\n\n${config.reactions.join(' ')}`);
                break;

            case 'fixed':
                if (!args[1]) {
                    await reply(`Current emoji: ${config.fixedEmoji}\n\nUsage: ${global.prefix}autoreact fixed ⚡`);
                    return;
                }
                const emoji = args[1];
                if ([...emoji].length <= 2) {
                    config.fixedEmoji = emoji;
                    config.mode = 'fixed';
                    saveConfig();
                    await reply(`✅ Emoji set to: ${emoji}`);
                } else {
                    await reply('❌ Invalid emoji.');
                }
                break;

            case 'cycle':
                if (!config.reactions.length) {
                    await reply('❌ No emojis in cycle list. Use `.autoreact setrandom ⚡,❤️,🔥` first.');
                    return;
                }
                config.mode = 'cycle';
                config.cycleIndex = 0;
                saveConfig();
                await reply(`🔄 *CYCLE MODE*\n\n${config.reactions.map((e, i) => `${i+1}. ${e}`).join('\n')}`);
                break;

            case 'setrandom':
            case 'setemojis':
                const input = args.slice(1).join(' ').split(',').map(e => e.trim()).filter(Boolean);
                if (!input.length) {
                    await reply(`Usage: ${global.prefix}autoreact setrandom ⚡,❤️,🔥,💯`);
                    return;
                }
                const valid = input.filter(e => [...e].length <= 2);
                if (!valid.length) {
                    await reply('❌ No valid emojis found.');
                    return;
                }
                config.reactions = valid;
                config.mode = 'cycle';
                config.cycleIndex = 0;
                saveConfig();
                await reply(`✅ Emoji pool set (${valid.length}): ${valid.join(' ')}`);
                break;

            case 'exclude':
            case 'skip':
                if (!args[1]) {
                    await reply(`Usage: ${global.prefix}autoreact exclude 2547xxxx`);
                    return;
                }
                const num = args[1].replace(/[^0-9]/g, '');
                if (!config.excludedContacts.includes(num)) {
                    config.excludedContacts.push(num);
                    saveConfig();
                    await reply(`✅ Excluded +${num} from auto-react.`);
                } else {
                    await reply(`⚠️ +${num} is already excluded.`);
                }
                break;

            case 'include':
            case 'unexclude':
                if (!args[1]) {
                    await reply(`Usage: ${global.prefix}autoreact include 2547xxxx`);
                    return;
                }
                const incNum = args[1].replace(/[^0-9]/g, '');
                const idx = config.excludedContacts.indexOf(incNum);
                if (idx !== -1) {
                    config.excludedContacts.splice(idx, 1);
                    saveConfig();
                    await reply(`✅ Removed +${incNum} from exclude list.`);
                } else {
                    await reply(`⚠️ +${incNum} was not excluded.`);
                }
                break;

            case 'excluded':
            case 'skiplist':
                if (!config.excludedContacts.length) {
                    await reply('📭 No contacts excluded.');
                    return;
                }
                let listText = `🚫 *SKIP LIST (${config.excludedContacts.length})*\n\n`;
                config.excludedContacts.forEach((n, i) => {
                    listText += `${i+1}. +${n}\n`;
                });
                await reply(listText);
                break;

            case 'stats':
                const viewLabel = config.viewMode === 'view+react' ? '👁️+⚡' : '⚡ only';
                let statsText = `📊 *AUTOREACT STATS*\n\n`;
                statsText += `Status     : ${config.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}\n`;
                statsText += `View Mode  : ${viewLabel}\n`;
                statsText += `Emoji Mode : ${config.mode === 'fixed' ? `FIXED (${config.fixedEmoji})` : config.mode === 'cycle' ? `CYCLE (${config.reactions.length} emojis)` : 'RANDOM'}\n`;
                statsText += `Total      : ${config.totalReacted || 0}\n`;
                statsText += `Tracked    : ${reactedSet.size}\n`;
                statsText += `Excluded   : ${config.excludedContacts.length}\n`;
                await reply(statsText);
                break;

            case 'reset':
            case 'clear':
                config.totalReacted = 0;
                reactedSet.clear();
                config.reactedStatuses = [];
                saveConfig();
                await reply('🔄 *Reset complete.* All logs cleared.');
                break;

            default:
                await reply(`❌ Unknown option. Use *${global.prefix}autoreact* to see commands.`);
        }
    }
};

// Auto-react to status messages (called from bot.js)
async function handleStatusAutoReact(sock, msg) {
    try {
        if (!config.enabled) return;
        if (!msg?.key || msg.key.fromMe) return;
        if (msg.key.remoteJid !== 'status@broadcast') return;
        const statusKey = {
            id: msg.key.id,
            remoteJid: msg.key.remoteJid,
            participant: msg.key.participant || msg.key.remoteJid
        };
        if (isExcluded(statusKey.participant)) return;
        if (hasReacted(statusKey)) return;

        // View status (if enabled)
        if (config.viewMode === 'view+react') {
            try {
                await sock.readMessages([{
                    remoteJid: 'status@broadcast',
                    id: statusKey.id,
                    fromMe: false,
                    participant: statusKey.participant
                }]);
            } catch (_) {}
        }

        const emoji = getReaction();
        try {
            await sock.sendMessage(
                'status@broadcast',
                {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: 'status@broadcast',
                            id: statusKey.id,
                            participant: statusKey.participant,
                            fromMe: false
                        }
                    }
                },
                { statusJidList: [statusKey.participant] }
            );
            markReacted(statusKey);
            addLog(statusKey.participant, emoji, statusKey.id);
            console.log(`✅ [AUTOREACT] ${emoji} to status from ${statusKey.participant}`);
        } catch (_) {}
    } catch (_) {}
}

module.exports.handleStatusAutoReact = handleStatusAutoReact;
