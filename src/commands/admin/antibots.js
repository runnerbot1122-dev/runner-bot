const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antibots", "antibotaо"],
    description: "Anti-Bot (bloqueia mensagens de outros bots)",
    settingKey: "antiBots"
});