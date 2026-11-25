require('dotenv').config();
const express = require('express');
const cors = require('cors');
const manager = require('./src/core/manager');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const pendingCodes = new Map(); // number -> { code, expiresAt }

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'runner-bot-api' });
});

app.get('/api/stats', (req, res) => {
    let active = 0;
    try {
        // conta sockets abertos via API do manager
        const ids = (manager.bots && manager.bots._ids) || [];
        for (const id of ids) if (manager.bots.get(id)) active++;
    } catch {}
    res.json({
        ok: true,
        totalUsers: active,
        activeSessions: active,
        activeBots: active,
        totalPaired: active,
        dailyNew: 0
    });
});

app.post('/api/pair', async (req, res) => {
    try {
        const raw = req.body?.number;
        if (!raw || typeof raw !== 'string') {
            return res.status(400).json({ error: 'Número inválido.' });
        }
        const number = raw.replace(/\D/g, '');
        if (number.length < 10 || number.length > 15) {
            return res.status(400).json({ error: 'Número inválido. Use DDI + DDD + número.' });
        }

        const now = Date.now();
        const existing = pendingCodes.get(number);
        if (existing && existing.expiresAt > now) {
            return res.json({
                code: existing.code,
                number,
                expiresIn: Math.ceil((existing.expiresAt - now) / 1000)
            });
        }

        // chama o SEU manager e espera o código chegar
        const resultado = await new Promise((resolve) => {
            let finalizado = false;
            const concluir = (v) => {
                if (finalizado) return;
                finalizado = true;
                clearTimeout(timeout);
                resolve(v);
            };

            const timeout = setTimeout(() => {
                concluir({ error: 'Tempo esgotado ao gerar o código. Tente novamente.' });
            }, 30000);

            try {
                manager.criarBot(number, {
                    pairingNumber: number,
                    aoReceberCodigo: (code) => {
                        pendingCodes.set(number, { code, expiresAt: Date.now() + 120000 });
                        concluir({ code });
                    },
                    aoFalhar: (err) => {
                        concluir({ error: err?.message || 'Falha ao gerar o código.' });
                    }
                }).catch((err) => {
                    concluir({ error: err?.message || 'Erro ao iniciar pareamento.' });
                });
            } catch (err) {
                concluir({ error: err?.message || 'Erro ao iniciar pareamento.' });
            }
        });

        if (resultado.error) {
            return res.status(500).json({ error: resultado.error });
        }

        return res.json({ code: resultado.code, number, expiresIn: 120 });
    } catch (err) {
        console.error('[pair] erro:', err);
        return res.status(500).json({ error: 'Não foi possível gerar o código.' });
    }
});

// limpa códigos expirados
setInterval(() => {
    const now = Date.now();
    for (const [n, d] of pendingCodes.entries()) {
        if (d.expiresAt < now) pendingCodes.delete(n);
    }
}, 60 * 1000);

app.listen(PORT, () => console.log(`[server] rodando na porta ${PORT}`));
