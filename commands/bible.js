const axios = require('axios');

const BOOK_ALIASES = {
    'gen': 'genesis', 'ex': 'exodus', 'lev': 'leviticus', 'num': 'numbers',
    'deut': 'deuteronomy', 'josh': 'joshua', 'judg': 'judges', 'rut': 'ruth',
    '1sam': '1samuel', '2sam': '2samuel', '1kgs': '1kings', '2kgs': '2kings',
    '1chr': '1chronicles', '2chr': '2chronicles', 'ezra': 'ezra', 'neh': 'nehemiah',
    'est': 'esther', 'job': 'job', 'ps': 'psalms', 'prov': 'proverbs',
    'eccl': 'ecclesiastes', 'song': 'songofsolomon', 'sos': 'songofsolomon',
    'isa': 'isaiah', 'jer': 'jeremiah', 'lam': 'lamentations', 'ezek': 'ezekiel',
    'dan': 'daniel', 'hos': 'hosea', 'joel': 'joel', 'amos': 'amos',
    'obad': 'obadiah', 'jon': 'jonah', 'mic': 'micah', 'nah': 'nahum',
    'hab': 'habakkuk', 'zeph': 'zephaniah', 'hag': 'haggai', 'zech': 'zechariah',
    'mal': 'malachi', 'mt': 'matthew', 'mk': 'mark', 'lk': 'luke', 'jn': 'john',
    'acts': 'acts', 'rom': 'romans', '1cor': '1corinthians', '2cor': '2corinthians',
    'gal': 'galatians', 'eph': 'ephesians', 'phil': 'philippians', 'col': 'colossians',
    '1thess': '1thessalonians', '2thess': '2thessalonians', '1tim': '1timothy',
    '2tim': '2timothy', 'tit': 'titus', 'philem': 'philemon', 'heb': 'hebrews',
    'jas': 'james', '1pet': '1peter', '2pet': '2peter', '1jn': '1john',
    '2jn': '2john', '3jn': '3john', 'jud': 'jude', 'rev': 'revelation'
};

function normalizeBook(input) {
    const lower = input.toLowerCase().replace(/\s+/g, '');
    return BOOK_ALIASES[lower] || lower;
}

module.exports = {
    name: 'bible',
    category: 'religion',
    description: 'Get a Bible verse (e.g., .bible John 3:16 or .bible John 3 16)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (args.length < 2) {
            return sock.sendMessage(from, { text: '❌ Usage: .bible <book> <chapter>:<verse> or .bible <book> <chapter> <verse>\nExample: .bible John 3:16' }, { quoted: msg });
        }

        let bookInput, chapter, verse;

        if (args[1] && args[1].includes(':')) {
            bookInput = args.slice(0, 1).join(' ');
            const parts = args[1].split(':');
            chapter = parseInt(parts[0]);
            verse = parseInt(parts[1]);
        } else if (args.length >= 3) {
            bookInput = args.slice(0, -2).join(' ');
            chapter = parseInt(args[args.length - 2]);
            verse = parseInt(args[args.length - 1]);
        } else {
            return sock.sendMessage(from, { text: '❌ Invalid format. Use .bible John 3:16 or .bible John 3 16' }, { quoted: msg });
        }

        if (isNaN(chapter) || isNaN(verse) || chapter < 1 || verse < 1) {
            return sock.sendMessage(from, { text: '❌ Chapter and verse must be valid numbers.' }, { quoted: msg });
        }

        const book = normalizeBook(bookInput);
        const version = 'en-kjv';

        try {
            const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${book}/chapters/${chapter}/verses/${verse}.json`;
            const res = await axios.get(url);
            const data = res.data;

            const text = `📖 *${data.reference || `${book} ${chapter}:${verse}`} (KJV)*\n\n${data.text || data.verse || 'Verse not found.'}`;
            await sock.sendMessage(from, { text }, { quoted: msg });
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                await sock.sendMessage(from, { text: '❌ Verse not found. Check the book, chapter, and verse numbers.' }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: '❌ Failed to fetch the verse. Please try again later.' }, { quoted: msg });
            }
        }
    }
};
