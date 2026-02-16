const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const MY_NAME = 'Jeswin';
const TARGET_GROUP = 'Hi';
const COOLDOWN = 1000 * 60 * 10; // 10 minutes
let lastReplyTime = 0;

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot', dataPath: process.env.DATA_PATH || './auth' }),
    puppeteer: {
        headless: true,
        executablePath: undefined,
        browserWSEndpoint: 'wss://chrome.browserless.io?token=2TzEdpbrTA592M484cc3561e35cf8287cd188f81cbf86bf0d'
    }
});

// QR handler: prints a very small QR code in terminal
client.on('qr', async qr => {
    console.log('Scan this QR code in WhatsApp:');
    try {
        // tiny ASCII version
        const asciiQr = await QRCode.toString(qr, { type: 'terminal', small: true });
        console.log(asciiQr);
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
});

client.on('ready', () => {
    console.log('Bot is ready ✔️');
});

client.on('message', async msg => {
    try {
        if (!msg.from.endsWith('@g.us')) return;
        if (msg.fromMe) return;

        const chat = await msg.getChat();
        if (chat.name !== TARGET_GROUP) return;

        const text = msg.body.toLowerCase().trim();
        console.log(`Message in ${chat.name}: "${text}"`);

        const isOTMessage = text.includes('ot') && text.includes('available');
        if (!isOTMessage) return;

        const now = Date.now();
        if (now - lastReplyTime < COOLDOWN) return;
        lastReplyTime = now;

        setTimeout(async () => {
            console.log(`Replying with: ${MY_NAME}`);
            await msg.reply(MY_NAME);
        }, 2000);

    } catch (error) {
        console.error('Error handling message:', error);
    }
});

client.initialize();
