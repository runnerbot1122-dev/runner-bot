const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: "anticatalogo",
    description: "Anti-Catálogo (bloqueia mensagens de catálogo)",
    settingKey: "antiCatalogo"
});