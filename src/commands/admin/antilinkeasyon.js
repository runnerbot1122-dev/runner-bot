const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antilinkeasyon", "antilinkeary"],
    description: "Anti-Link Easy (apenas aviso e remoção)",
    settingKey: "antiLinkEasy"
});