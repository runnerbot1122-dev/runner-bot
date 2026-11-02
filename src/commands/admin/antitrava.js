const { criarComandoProtecao } = require("../../utils/protectionFactory");

module.exports = criarComandoProtecao({
    name: ["antitrava", "antitravas"],
    description: "Anti-Trava (bloqueia mensagens de texto que travam o WhatsApp)",
    settingKey: "antiTrava"
});