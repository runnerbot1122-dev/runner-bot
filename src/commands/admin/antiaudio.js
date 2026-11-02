const { criarComandoProtecao } = require("../../utils/protectionFactory");

module.exports = criarComandoProtecao({
    name: "antiaudio",
    description: "Anti-Áudio (impede o envio de áudios)",
    settingKey: "antiAudio"
});