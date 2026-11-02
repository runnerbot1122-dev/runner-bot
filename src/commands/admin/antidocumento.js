const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: "antidocumento",
    description: "Anti-Documento (bloqueia arquivos)",
    settingKey: "antiDocumento"
});