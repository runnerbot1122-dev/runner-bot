const { criarComandoProtecao } = require("../../utils/protectionFactory");
module.exports = criarComandoProtecao({
    name: ["antipay", "antipagamento"],
    description: "Anti-Pay (bloqueia pedidos de pagamento no grupo)",
    settingKey: "antiPay"
});