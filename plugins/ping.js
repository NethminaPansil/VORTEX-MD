module.exports = {
    name: 'ping',
    alias: ['pong'],
    category: 'utility',
    desc: 'Check bot response time',
    async execute(m, { reply }) {
        const start = Date.now();
        await reply('🏓 Pinging...');
        const end = Date.now();
        reply(`🏓 Pong! Response Time: ${end - start}ms`);
    }
};
