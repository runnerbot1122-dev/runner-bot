const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: "anticontato",
    description: "Anti-Contato (bloqueia envio de cartões de contato)",
    settingKey: "antiContato"
});