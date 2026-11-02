const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antibtm", "antibtn"],
    description: "Anti-BTN (bloqueia botões nativos suspeitos)",
    settingKey: "antiBtn"
});