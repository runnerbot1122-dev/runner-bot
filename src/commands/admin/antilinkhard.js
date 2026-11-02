const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: "antilinkhard",
    description: "Anti-Link Hard (punição severa para links)",
    settingKey: "antiLinkHard"
});