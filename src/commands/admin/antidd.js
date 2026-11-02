const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antidd", "antidd-list"],
    description: "Anti-DDD (bloqueia números com DDDs específicos)",
    settingKey: "antiDdd"
});