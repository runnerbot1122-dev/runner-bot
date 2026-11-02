const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antipalavra", "antipalavrao", "antipalavrão"],
    description: "Anti-Palavra (bloqueia palavras de baixo calão)",
    settingKey: "antiPalavra"
});