const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antinotas", "antinota"],
    description: "Anti-Notas (bloqueia mensagens de nota no grupo)",
    settingKey: "antiNotas"
});