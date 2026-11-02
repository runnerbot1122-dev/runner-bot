const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: "antidoc",
    description: "Anti-Documento (bloqueia PDFs, Word, etc)",
    settingKey: "antiDoc"
});