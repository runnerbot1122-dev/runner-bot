const { criarComandoProtecao } = require("../../utils/protectionFactory");

module.exports = criarComandoProtecao({
    name: "antiimg",
    description: "Anti-Imagem (impede o envio de fotos)",
    settingKey: "antiImg"
});