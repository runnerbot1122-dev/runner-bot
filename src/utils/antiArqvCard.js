
const { readCents, formatCents } = require("../database/paymentConfig");
const fonteNYX = require("./fonteNYX");

async function gerarCartaoSVG(valorTexto) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <rect width="512" height="512" fill="#1A1A1A"/>
        <rect x="20" y="150" width="472" height="212" fill="#000000" rx="20"/>
        <text x="50%" y="55%" font-family="Arial, Helvetica, sans-serif" font-size="70" font-weight="bold" fill="#8A2BE2" text-anchor="middle" dominant-baseline="middle">
            ${valorTexto}
        </text>
    </svg>
    `;

    return Buffer.from(svg, "utf8");
}

async function enviarCartaoAntiRoubo(
    sock,
    groupId,
    groupName,
    actor,
    alvo,
    sucesso,
    tipo = "promote",
    alvoRestaurado = false
) {
    const cents = readCents();
    const valorTexto = formatCents(cents);

    let svgBuffer = null;

    try {
        svgBuffer = await gerarCartaoSVG(valorTexto);
    } catch (erro) {
        console.error("[ANTI-ARQV] Erro ao gerar SVG:", erro);
    }

    const actorTag = `@${actor.split("@")[0]}`;
    const alvoTag = alvo ? `@${alvo.split("@")[0]}` : "membro";

    let caption = `*ANTI-ROUBO*\n`;
    caption += `*GRUPO:* ${groupName}\n\n`;

    if (tipo === "demote") {
        caption += `${actorTag} *TENTOU REBAIXAR* ${alvoTag} *SEM PERMISSÃO.*\n\n`;

        if (sucesso) {
            caption += `${actorTag} *FOI REBAIXADO.*\n`;

            if (alvoRestaurado) {
                caption += `${alvoTag} *TEVE SEU CARGO DE ADMINISTRADOR RESTAURADO.*`;
            } else {
                caption += `⚠️ *Não consegui confirmar a restauração do administrador.*`;
            }
        } else {
            caption += `⚠️ *Não consegui confirmar o rebaixamento do autor.*\n`;

            if (alvoRestaurado) {
                caption += `${alvoTag} *TEVE SEU CARGO DE ADMINISTRADOR RESTAURADO.*`;
            } else {
                caption += `⚠️ *Também não consegui confirmar a restauração do administrador.*`;
            }
        }
    } else {
        caption += `${actorTag} *TENTOU PROMOVER* ${alvoTag} *SEM PERMISSÃO.*\n\n`;

        if (sucesso) {
            caption += `${actorTag} *FOI REBAIXADO.*\n`;
            if (alvo) caption += `${alvoTag} *FOI REBAIXADO.*`;
        } else {
            caption += `⚠️ *Não consegui confirmar o rebaixamento.* Verifique as permissões.`;
        }
    }

    const mentions = [actor, alvo].filter(Boolean);

    const payload = {
        caption: fonteNYX(caption),
        mentions
    };

    if (svgBuffer) {
        payload.image = svgBuffer;
    } else {
        payload.text = payload.caption;
        delete payload.caption;
    }

    try {
        await sock.sendMessage(groupId, payload);
    } catch (erro) {
        console.error("[ANTI-ARQV] Erro no envio da imagem:", erro);

        await sock.sendMessage(groupId, {
            text: fonteNYX(caption),
            mentions
        }).catch(() => {});
    }
}

module.exports = { enviarCartaoAntiRoubo };
