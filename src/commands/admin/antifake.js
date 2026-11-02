const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: "antifake",
    description: "Anti-Fake (bloqueia números suspeitos)",
    settingKey: "antiFake"
});