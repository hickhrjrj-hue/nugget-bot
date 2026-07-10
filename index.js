const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express'); 
const app = express();
const port = process.env.PORT || 3000;

let latestQr = '';

app.get('/', (req, res) => {
    if (latestQr) {
        res.send(`
            <style>body { font-family: sans-serif; text-align: center; padding: 50px; }</style>
            <h1>The Nugget Lord Bot</h1>
            <p>Scan this QR code with WhatsApp to connect:</p>
            <img src="https://qrserver.com{encodeURIComponent(latestQr)}" alt="QR Code"/>
        `);
    } else {
        res.send('<h1>The Nugget Lord Bot</h1><p>Bot is active! Either it is already connected, or initializing...</p>');
    }
});

app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
});

const client = new Client({
    // FIXED FOR RENDER: Forces session storage into a writeable server directory
    authStrategy: new LocalAuth({
        dataPath: '/tmp/.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    latestQr = qr; 
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above!');
});

client.on('ready', () => {
    latestQr = ''; 
    console.log('Your WhatsApp Bot is ready!');
});

// Handles normal incoming messages from other people
client.on('message', async (msg) => {
    const incomingText = msg.body.toLowerCase();

    if (incomingText === '.menu') {
        const menuText = `🤖 *Welcome to the Bot Menu created by the nugget lord!* 🤖\n\nHere are the commands you can use:\n👉 *hi*\n👉 *.nugget NUGGETS ARE THE BEST*\n👉 *!ping*\n\n_Type any command exactly as shown above!_`;
        await msg.reply(menuText);
    }
    if (incomingText === '!ping') {
        await msg.reply('pong!');
    }
    if (incomingText === 'hi' || incomingText === 'hello') {
        await msg.reply('The Nugget lord is here');
    }
    if (incomingText.startsWith('.nugget')) {
        await msg.reply('NUGGETS ARE THE BEST!');
    }
});

// Handles messages you send to yourself from your own phone
client.on('message_create', async (msg) => {
    if (msg.fromMe && msg.to === msg.from) {
        const incomingText = msg.body.toLowerCase();

        if (incomingText === '.menu') {
            await msg.reply('🤖 *Self-Chat Menu!* 🤖\n\nCommands work here too:\n👉 *hi*\n👉 *!ping*\n👉 *.nugget*');
        }
        if (incomingText === '!ping') {
            await msg.reply('pong! (self-test)');
        }
        if (incomingText === 'hi' || incomingText === 'hello') {
            await msg.reply('MASTER');
        }
        if (incomingText.startsWith('.nugget')) {
            await msg.reply('REBUILD THE NUGGET ARMY');
        }
    }
});

client.initialize();
