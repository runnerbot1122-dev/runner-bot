const { criarComandoProtecao } = require("../../utils/protectionFactory");

module.exports = criarComandoProtecao({
    name: "antivideo",
    description: "Anti-Vídeo (impede o envio de vídeos)",
    settingKey: "antiVideo"
});