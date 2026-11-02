const { criarComandoProtecao } = require("../../utils/protectionFactory");

module.exports = criarComandoProtecao({
    name: "antisticker",
    description: "Anti-Figurinha (impede o envio de stickers)",
    settingKey: "antiSticker"
});