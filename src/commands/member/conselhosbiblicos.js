const replyNYX = require("../../utils/replyNYX");

const conselhos = [
    {
        texto: "Confie no Senhor de todo o seu coração e não se apoie somente no seu próprio entendimento.",
        referencia: "Provérbios 3:5"
    },
    {
        texto: "Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu.",
        referencia: "Eclesiastes 3:1"
    },
    {
        texto: "Seja forte e corajoso. Não tenha medo, porque o Senhor seu Deus estará com você por onde andar.",
        referencia: "Josué 1:9"
    },
    {
        texto: "Entregue ao Senhor as suas obras, e os seus planos serão estabelecidos.",
        referencia: "Provérbios 16:3"
    },
    {
        texto: "A resposta branda desvia o furor, mas a palavra dura provoca a ira.",
        referencia: "Provérbios 15:1"
    },
    {
        texto: "Não se canse de fazer o bem, pois no tempo certo você colherá, se não desistir.",
        referencia: "Gálatas 6:9"
    },
    {
        texto: "O Senhor é o meu pastor; nada me faltará.",
        referencia: "Salmos 23:1"
    },
    {
        texto: "A ansiedade pode ser aliviada pela oração, pela gratidão e pela confiança em Deus.",
        referencia: "Filipenses 4:6-7"
    }
];

module.exports = {
    name: ["conselhosbilbicos"],
    description: "Envia um conselho bíblico aleatório",
    execute: async (ctx) => {
        const conselho = conselhos[Math.floor(Math.random() * conselhos.length)];

        try { await ctx.react("📖"); } catch (e) {}

        await replyNYX(ctx,
`╔═━✰『 ᴄᴏɴsᴇʟʜᴏ ʙíʙʟɪᴄᴏ 』═━✰

║╎⊹ ࣪ ˖ 📖 ▸ “${conselho.texto}”
║╎⊹ ࣪ ˖ 📌 ▸ *${conselho.referencia}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`, "bot");
    }
};
