const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antistatus", "anti-status"],
    description: "Anti-Status (bloqueia marcações de status no grupo)",
    settingKey: "antiStatus"
});