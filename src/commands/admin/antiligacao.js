const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antiligacao", "anti-call", "anticall"],
    description: "Anti-Ligação (bloqueia chamadas no grupo)",
    settingKey: "antiLigacao"
});