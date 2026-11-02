const ownerOnly = require('../../utils/ownerOnly');
const db = require('../../database/securityGroups');
const { getTarget } = require('../../utils/checkTarget');
module.exports = {
  name: ['donogp'],
  description: 'Registra o dono responsável por promover e rebaixar membros deste grupo',
  execute: async (ctx) => {
    ownerOnly(ctx);
    if (!ctx.isGroup) return ctx.replyNYX('❌ Use este comando em um grupo.', 'bot');
    const target = getTarget(ctx);
    if (!target) return ctx.replyNYX('Marque ou responda à pessoa que será registrada como dono deste grupo.', 'bot');
    try {
      const added = db.addGroupOwner(ctx.chat, target);
      await ctx.replyNYX(added ? '*ɴᴜᴍᴇʀᴏ ʀᴇɢɪsᴛʀᴀᴅᴏ ᴄᴏᴍ sᴜᴄᴇssᴏ 🙇‍♂️*' : '*ᴇꜱꜱᴀ ᴩᴇꜱꜱᴏᴀ ᴊᴀ ᴇꜱᴛᴀ ʀᴇɢɪꜱᴛʀᴀᴅᴀ 🤷‍♂️*', 'bot');
    } catch (error) {
      if (error.message === 'USER_REQUIRED') return ctx.replyNYX('❌ Não consegui identificar o número. Marque a pessoa ou responda à mensagem dela.', 'bot');
      throw error;
    }
  }
};
