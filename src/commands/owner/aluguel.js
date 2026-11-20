const { requireOwner } = require("../../utils/checkPermission");
const {
    getRentalMode,
    registerRental,
    MAX_RENTAL_DAYS,
    MAX_RENTAL_HOURS
} = require("../../database/rentals");

function parseDuration(args) {
    if (!args.length) {
        return { help: true };
    }

    if (args.length === 1) {
        const match = /^(\d+)d$/i.exec(String(args[0]).trim());
        if (!match) {
            return null;
        }
        const days = Number(match[1]);
        if (!Number.isSafeInteger(days) || days < 1 || days > MAX_RENTAL_DAYS) {
            return null;
        }
        return { days, hours: 0 };
    }

    if (args.length !== 2 || !args.every(value => /^\d+$/.test(String(value).trim()))) {
        return null;
    }

    const days = Number(args[0]);
    const hours = Number(args[1]);
    if (
        !Number.isSafeInteger(days) ||
        !Number.isSafeInteger(hours) ||
        days < 0 ||
        days > MAX_RENTAL_DAYS ||
        hours < 0 ||
        hours > MAX_RENTAL_HOURS ||
        (days === 0 && hours === 0)
    ) {
        return null;
    }

    return { days, hours };
}

function formatExpiry(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).format(date);
}

async function reject(ctx, message, code) {
    await ctx.replyNYX(message, "bot");
    throw new Error(code);
}

module.exports = {
    name: ["aluguel", "alugar"],
    description: "Registra o grupo atual por uma duração definida",

    execute: async ctx => {
        requireOwner(ctx);
        if (!ctx.isGroup) {
            return reject(
                ctx,
                "❌ Este comando só funciona em grupos.",
                "RENTAL_GROUP_ONLY"
            );
        }

        let enabled;
        try {
            enabled = getRentalMode();
        } catch (error) {
            console.error("Erro ao ler modo aluguel:", error);
            return reject(
                ctx,
                "❌ Não foi possível ler o modo aluguel.",
                "RENTAL_MODE_STORAGE_ERROR"
            );
        }

        if (!enabled) {
            return reject(
                ctx,
                "❌ O modo aluguel está desativado. 🙅‍♂️",
                "RENTAL_MODE_DISABLED"
            );
        }

        const args = Array.isArray(ctx.args) ? ctx.args : [];
        const duration = parseDuration(args);
        if (duration && duration.help) {
            return ctx.replyNYX(
                "Digite o tempo de aluguel em dias.\nEx: ,aluguel 2 4 (2 dias e 4 horas)",
                "bot"
            );
        }
        if (!duration) {
            return reject(
                ctx,
                "❌ Duração inválida. Use 30d ou informe dias e horas, como: aluguel 2 4.",
                "RENTAL_DURATION_INVALID"
            );
        }

        const expiresAt = new Date(
            Date.now() + ((duration.days * 24 + duration.hours) * 60 * 60 * 1000)
        );

        try {
            const record = registerRental(ctx.chat, expiresAt.toISOString());
            return ctx.replyNYX(
                `✅ Grupo cadastrado até ${formatExpiry(new Date(record.expiresAt))}.`,
                "bot"
            );
        } catch (error) {
            console.error("Erro ao registrar aluguel:", error);
            return reject(
                ctx,
                "❌ Não foi possível registrar o aluguel local.",
                "RENTAL_STORAGE_ERROR"
            );
        }
    }
};

module.exports.parseDuration = parseDuration;
module.exports.formatExpiry = formatExpiry;