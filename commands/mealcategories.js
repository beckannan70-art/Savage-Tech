const axios = require('axios');

module.exports = {
    name: 'mealcategories',
    category: 'food',
    description: 'List all meal categories with a random category image',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        try {
            const apiKey = 'wxa_f_28d599362e';
            const url = `https://apis.xwolf.space/api/food/meal/categories?key=${apiKey}`;
            const response = await axios.get(url, { timeout: 15000 });
            const data = response.data;

            if (!data.success) {
                return sock.sendMessage(from, { text: '❌ Failed to fetch meal categories.' }, { quoted: msg });
            }

            let categories = [];
            if (Array.isArray(data.categories)) categories = data.categories;
            else if (Array.isArray(data.result)) categories = data.result;
            else if (Array.isArray(data)) categories = data;

            if (categories.length === 0) {
                return sock.sendMessage(from, { text: '❌ No categories found.' }, { quoted: msg });
            }

            let text = '🍽️ *Meal Categories*\n\n';
            const categoryNames = [];
            for (const cat of categories) {
                const name = cat.name || cat.strCategory || cat.category || cat.title || JSON.stringify(cat);
                categoryNames.push(name);
                text += `🔹 ${name}\n`;
            }

            const randomCat = categoryNames[Math.floor(Math.random() * categoryNames.length)];
            const imageUrl = `https://www.themealdb.com/images/category/${randomCat.toLowerCase()}.png`;

            let imageBuffer = null;
            try {
                const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
                imageBuffer = Buffer.from(imgRes.data);
            } catch (imgErr) {}

            if (imageBuffer) {
                await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text }, { quoted: msg });
            }
        } catch (err) {
            console.error('Meal categories error:', err);
            await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
        }
    }
};
