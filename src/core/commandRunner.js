const comandos =
    require("./loader");

const {
    permissionMessage
} = require("../utils/checkPermission");

const {
    registrarLog
} = require("../utils/botLogger");

const {
    registrarErro
} = require("../utils/errorLogger");

const x9 =
    require("../utils/x9");

const logger =
    require("../utils/logger");

const soadm =
    require("../utils/soadm");

const publicCommands =
    require("../config/publicCommands");

const {
    applyCommandSuccessReaction,
    applyCommandErrorReaction,
    reactNYX
} = require("./reactionManager");

const security =
    require("../database/securityGroups");

async function executarComando(ctx){


const cmd =
    comandos.get(
        ctx.command
    );


if(!cmd){

    await reactNYX(
        ctx,
        "❌"
    );

    return;
}

try {


// Defesa em profundidade: comandos carregados da pasta owner exigem
// autorização de dono/MESTRE antes de executar qualquer lógica do comando.
// A verificação local de cada comando continua válida e não é substituída.
if (cmd.category === "owner") {
    const { requireOwner } = require("../utils/checkPermission");
    requireOwner(ctx);
}

// Bloqueios de comandos, tanto globais quanto específicos do grupo.
if (!ctx.isOwner) {
    try {
        const blockRules = require("../database/blockRules");
        const names = [...new Set([...(Array.isArray(cmd.name) ? cmd.name : [cmd.name]), ctx.command].filter(Boolean))];
        if (names.some(name => blockRules.isCommandBlocked(name, ctx.isGroup ? ctx.chat : null))) {
            await ctx.replyNYX("🚫 Este comando está bloqueado neste contexto.", "bot");
            return;
        }
    } catch (error) {
        registrarErro({ command: ctx.command, sender: ctx.sender, chat: ctx.chat, error: `Falha ao consultar bloqueios de comandos: ${error.stack || error.message}` });
        await ctx.replyNYX("❌ Não foi possível verificar os bloqueios agora. Tente novamente mais tarde.", "bot");
        return;
    }
}


// Comandos podem declarar vipOnly: true no objeto exportado.
// Ser VIP não concede permissões de dono ou administrador.
let exclusivoVip = cmd.vipOnly === true;
if (!exclusivoVip) {
    try {
        const { isVipCommand } = require("../database/vipCommands");
        const nomesComandoVip = Array.isArray(cmd.name) ? cmd.name : [cmd.name, ctx.command];
        exclusivoVip = [...new Set([...nomesComandoVip, ctx.command].filter(Boolean))]
            .some(nome => isVipCommand(nome));
    } catch (error) {
        registrarErro({
            command: ctx.command,
            sender: ctx.sender,
            chat: ctx.chat,
            error: `Falha ao consultar comandos VIP: ${error.stack || error.message}`
        });
        await ctx.replyNYX("❌ Não foi possível verificar as permissões VIP agora. Tente novamente mais tarde.", "bot");
        return;
    }
}

if (exclusivoVip && !ctx.isOwner) {
    let vipAutorizado = false;
    try {
        const { isVip } = require("../database/vips");
        vipAutorizado = Boolean(ctx.sender && isVip(ctx.sender));
    } catch (error) {
        registrarErro({
            command: ctx.command,
            sender: ctx.sender,
            chat: ctx.chat,
            error: `Falha ao consultar VIP: ${error.stack || error.message}`
        });
        await ctx.replyNYX("❌ Não foi possível verificar seu status VIP agora. Tente novamente mais tarde.", "bot");
        return;
    }

    if (!vipAutorizado) {
        await ctx.replyNYX("💎 Este comando é exclusivo para usuários VIP.", "bot");
        return;
    }
}

// =========================================
// VERIFICAÇÃO DE PERMISSÕES MANUAIS (PERMS)
// =========================================
// Se o usuário tem permissão manual para este comando, ele pula as
// restrições de so_dono e soadm.
let temPermManual = false;
if (ctx.isGroup && !ctx.isOwner) {
    const nomesComando = Array.isArray(cmd.name) ? cmd.name : [cmd.name];
    temPermManual = nomesComando.some(nome => 
        security.hasPerm(ctx.chat, ctx.sender, nome) || 
        security.hasPerm(ctx.chat, ctx.sender, ctx.command)
    );
}

// =========================================
// SISTEMA SO_DONO (Modo Restrito)
// =========================================
if (
    !temPermManual &&
    ctx.isGroup &&
    !ctx.isOwner &&
    security.isSoDonoEnabled(ctx.chat)
) {
    const nomesComando = Array.isArray(cmd.name) ? cmd.name : [cmd.name];
    const comandoPublico = nomesComando.some(nome => publicCommands.includes(nome));

    if (!comandoPublico) {
        await ctx.replyNYX("🔒 Este grupo está em modo restrito. Apenas o dono pode usar comandos.", "bot");
        return;
    }
}

// =========================================
// SISTEMA SOADM
// =========================================
if (
    !temPermManual &&
    !ctx.isAdmin &&
    !ctx.isOwner
) {
    const nomesComando = Array.isArray(cmd.name) ? cmd.name : [cmd.name];
    const comandoPublico = nomesComando.some(nome => publicCommands.includes(nome));

    if (comandoPublico && ctx.isGroup && soadm.status(ctx.chat)) {
        return ctx.replyNYX(
            `ׄ ᨀ 🙇‍♂️. sᴏᴍᴇɴᴛᴇs ᴀᴅᴍs ᴘᴏᴅᴇᴍ ᴜsᴀʀ ᴇssᴇ ᴄᴏᴍᴀɴᴅᴏ `,
            "bot"
        );
    }
}

    await cmd.execute(ctx);

    // Registra apenas execuções concluídas sem erro para o painel ativadms.
    if (ctx.isGroup && ctx.isAdmin && !ctx.isOwner) {
        try {
            security.recordAdminUse(ctx.chat, ctx.sender);
        } catch (error) {
            registrarErro({ command: ctx.command, sender: ctx.sender, chat: ctx.chat, error: `Falha ao registrar uso do admin: ${error.message}` });
        }
    }

    await applyCommandSuccessReaction(ctx);

    if (
        ctx.isGroup &&
        ctx.command !== "soadm" &&
        x9.status(ctx.chat)
    ) {
        await logger.action(
            ctx.sock,
            {
                acao: "⚡ COMANDO EXECUTADO",
                executor: ctx.sender,
                alvo: ctx.sender,
                grupo: ctx.chat,
                motivo: `Comando: ${ctx.command}`
            }
        );
    }

    registrarLog({
        command: ctx.command,
        sender: ctx.sender,
        level: ctx.level,
        chat: ctx.chat
    });

} catch(error) {

    try {
        await applyCommandErrorReaction(ctx);
    } catch(reactionError) {
        console.log("Erro ao reagir por falha de comando:", reactionError.message);
    }

    const mensagem = permissionMessage(error);

    if(mensagem) {
        await ctx.reply(mensagem);
        return;
    }

    registrarErro({
        command: ctx.command,
        sender: ctx.sender,
        chat: ctx.chat,
        error: error.stack
    });

    console.error(error);

}

}

module.exports =
    executarComando;
