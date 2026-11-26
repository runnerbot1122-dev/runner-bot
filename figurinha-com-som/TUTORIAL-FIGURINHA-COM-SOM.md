# 🔊 FIGURINHA COM SOM — Kit para bots de WhatsApp (Baileys)

Sistema completo de **figurinhas com áudio** (o recurso novo do WhatsApp), extraído do bot **★彡 ASTA MD 彡★** — criado por **★彡 GEOVANE MD 彡★** (wa.me/5575920016995).

Funciona em qualquer bot feito com **Baileys** (nazuna, yuki, sandro, takeshi, bases "MD" em geral).

---

## ✨ O que o kit faz

| Ação no WhatsApp | Resultado |
|---|---|
| `.s` respondendo um **áudio / nota de voz / música** | Figurinha **com som** (capa com a onda do áudio) |
| Foto com legenda `.s` respondendo um áudio | Figurinha com som usando **a foto como capa** |
| `.s` em **vídeo com som** | Figurinha **animada com o som do vídeo** |
| `.s` em vídeo sem som, GIF ou imagem | Figurinha comum |
| `.s` respondendo uma **figurinha com som** | Refaz a figurinha **mantendo o som** |
| `.s 15` | Usa 15 segundos |
| `.s 1:05 10` | Começa em 1:05 e dura 10 segundos |
| `.s mudo` | Vídeo vira figurinha **sem** som |
| `.s circulo` | Figurinha **redonda** (mantém o som) |
| `.take Pacote\|Autor` | Troca o nome **sem perder o som** |

Também:
- O som é cortado, normalizado (volume igual) e convertido para o formato de nota de voz.
- Em áudio longo, o kit escolhe sozinho **o trecho mais forte**, normalmente o refrão.
- Figurinhas animadas saem **nítidas até 512px** e **fluidas, a 30 fps em vídeos de até 15s**. Elas sempre cabem no limite de ~1 MB do WhatsApp, acima do qual a figurinha trava.
- Quem ainda não tem o recurso no WhatsApp vê uma figurinha normal, sem erro.

---

## 📦 O que vem no kit

```
figurinha-com-som/
├── lib/
│   ├── index.mjs           ← API pronta: figurinha(), trocarPacote(), refazerFigurinha(), autoFigurinha()
│   ├── soundSticker.mjs    ← o protocolo da figurinha com som + preparo do áudio + envio
│   └── stickerEncoder.mjs  ← conversor imagem/vídeo → figurinha (nítida, fluida, < 1MB)
├── exemplos/
│   ├── exemplo-esm.mjs       ← para bots com "type": "module" (import)
│   └── exemplo-commonjs.js   ← para bots com require()
├── teste.mjs               ← teste local (não conecta no WhatsApp)
├── TUTORIAL-FIGURINHA-COM-SOM.md ← este tutorial
└── PROMPT-PARA-IA.txt      ← cole numa IA para ela instalar no seu bot
```

---

## 1️⃣ Requisitos

- **Node.js 18 ou mais novo.** Para ver a versão: `node -v`
- **Baileys** (o bot já tem). Funciona com os pacotes `baileys`, `@whiskeysockets/baileys`, `@itsukichan/baileys` e forks.
- **FFmpeg completo**, com `libopus` e `libwebp`:
  - **Windows:** baixe o "ffmpeg-release-full" em https://www.gyan.dev/ffmpeg/builds/, extraia em `C:\ffmpeg` e adicione `C:\ffmpeg\bin` ao PATH. Feche e abra o terminal de novo.
  - **Termux:** `pkg install ffmpeg`
  - **Linux/VPS:** `sudo apt install ffmpeg`
- Os pacotes **sharp** e **node-webpmux**. A maioria dos bots já tem; se não tiver, instale:

```bash
npm install sharp node-webpmux
```

> 💡 **Termux:** se o `sharp` der erro, use `pkg install libvips` e depois `npm install sharp --build-from-source`.

---

## 2️⃣ Instalação (5 minutos)

### Passo 1 — Copie a pasta
Coloque a pasta **`figurinha-com-som`** dentro do seu bot, por exemplo:
```
meu-bot/
├── index.js
├── package.json
└── figurinha-com-som/   ← aqui
```

### Passo 2 — Teste
Na pasta do bot, rode:
```bash
node figurinha-com-som/teste.mjs
```

Tem que aparecer **🎉 Tudo certo!** Se algo der ❌, veja a seção **Problemas** no fim.

### Passo 3 — Ligue no comando `.s` do seu bot

Descubra se o seu bot é **ESM** ou **CommonJS**:
- Se o `package.json` tem `"type": "module"` ou os arquivos usam `import ... from` → **ESM**
- Se os arquivos usam `require(...)` → **CommonJS**

#### 🟢 Bot ESM (import)

No arquivo onde ficam os comandos, **no topo**:
```js
import * as baileys from '@whiskeysockets/baileys'; // o MESMO nome que o seu bot usa
import { useBaileys, figurinha, trocarPacote, stickerOf, quotedOf } from './figurinha-com-som/lib/index.mjs';
useBaileys(baileys);
```

Troque o comando de figurinha (`case 's':`) por:
```js
case 's':
case 'sticker': {
  const r = await figurinha(sock, msg, {
    args: q,                     // texto depois do comando
    packname: 'Nome do Bot',
    author: msg.pushName || ''
  });
  if (!r.ok) await sock.sendMessage(from, { text: '❌ ' + r.erro }, { quoted: msg });
  break;
}
```

#### 🟡 Bot CommonJS (require)

No topo do arquivo de comandos:
```js
let kitFig;
const carregarKit = async () => {
  if (!kitFig) {
    kitFig = await import('./figurinha-com-som/lib/index.mjs');
    kitFig.useBaileys(require('@whiskeysockets/baileys')); // o MESMO nome que o seu bot usa
  }
  return kitFig;
};
```

E no comando:
```js
case 's':
case 'sticker': {
  const k = await carregarKit();
  const r = await k.figurinha(sock, msg, { args: q, packname: 'Nome do Bot', author: msg.pushName || '' });
  if (!r.ok) await sock.sendMessage(from, { text: '❌ ' + r.erro }, { quoted: msg });
  break;
}
```

> ⚠️ **Troque os nomes** pelos que o seu bot usa:
> - `sock` pode se chamar `conn`, `client`, `nazu`, `bot`, `sock`...
> - `msg` pode se chamar `m`, `info`, `mek`...
> - `from` é o chat (`msg.key.remoteJid`).
> - `q` é o texto depois do comando.
>
> O `msg` precisa ser **a mensagem original do Baileys**, aquela que tem `msg.key` e `msg.message`. Não serve uma versão "simplificada" do bot.

### Passo 4 — Reinicie o bot e teste
- Mande um áudio, responda com `.s` e chega uma figurinha **com som** 🔊
- Mande um vídeo com som e a legenda `.s` e chega uma figurinha animada com som

---

## 3️⃣ Manter o som nos outros comandos (take, rename, redonda...)

Qualquer comando que **pega uma figurinha e manda de novo** perde o som se usar `sendMessage({ sticker })`. Para manter, use:

```js
// .take / .rename — só muda o nome
const st = stickerOf(quotedOf(msg));                 // figurinha respondida (comum ou com som)
await trocarPacote(sock, from, st, { quoted: msg, packname: 'Pacote', author: 'Autor' });

// redonda / outro formato / com legenda
await refazerFigurinha(sock, from, st, { quoted: msg, circle: true });
```

Para comandos que **guardam** uma figurinha e mandam depois (auto-resposta, comando personalizado):

```js
import { stickerOf, getStickerSound, sendSoundSticker } from './figurinha-com-som/lib/index.mjs';
const clip = await getStickerSound(st);   // { ogg, seconds, waveform } ou null
// guarde clip.ogg (base64), clip.seconds e clip.waveform (base64) junto com a figurinha
// na hora de mandar:
if (clip) await sendSoundSticker(sock, jid, { webp: figurinhaBuffer, clip });
else await sock.sendMessage(jid, { sticker: figurinhaBuffer });
```

> 🔎 **Como saber se uma figurinha tem som:** a figurinha com som chega como `message.audioStickerMessage.message.stickerMessage`, e não como `message.stickerMessage`.
> Use sempre `stickerOf(mensagem)`, que pega os dois formatos. Se o seu bot procura só `stickerMessage`, ele **não vai enxergar** as figurinhas com som.

---

## 4️⃣ Autosticker com som

Se o seu bot tem autosticker, chame isto quando chegar uma foto ou vídeo:
```js
await autoFigurinha(sock, msg, { packname: 'Nome do Bot', author: msg.pushName || '' });
```
Vídeo com som vira figurinha com som; foto, GIF e vídeo mudo viram figurinha comum.

---

## 5️⃣ Ajustes opcionais

```js
import { configureEncoder, setSoundLimits } from './figurinha-com-som/lib/index.mjs';

configureEncoder({
  mode: 'qualidade',  // 'qualidade' (padrão, nítida) | 'auto' (equilíbrio) | 'fixo' (fps nunca baixa)
  fps30UpTo: 15,      // vídeos até 15s saem a 30 fps
  fps: 30,            // fps do modo 'fixo'
  debug: false        // true = mostra no console cada tentativa de conversão
});
setSoundLimits({ maxSeconds: 30 }); // duração máxima do som
```

Funções avulsas, para quem quer montar o próprio comando:

| Função | O que faz |
|---|---|
| `prepareClip(buffer, ext, { start, seconds })` | áudio ou vídeo → `{ ogg, seconds, waveform }` |
| `makeCover(waveform)` | capa automática com a onda do som |
| `coverFromImage(img)` | usa uma imagem como capa |
| `toWebp(buffer, { video, seconds, square, circle })` | imagem ou vídeo → figurinha webp |
| `writeExif(webp, { packname, author })` | grava o nome do pacote |
| `sendSoundSticker(sock, jid, { webp, clip, quoted, mentions })` | envia a figurinha com som |
| `stickerOf(msg)` / `getStickerSound(st)` | lê figurinhas com som recebidas |

---

## 🛠️ Problemas

| Problema | Solução |
|---|---|
| `ffmpeg não encontrado` | Instale o FFmpeg e coloque no PATH. No Windows, feche e abra o terminal. |
| `ffmpeg SEM libopus/libwebp` | Use a versão **full** do FFmpeg (gyan.dev no Windows). |
| `patch NÃO instalou` / `Não achei o Baileys` | Chame `useBaileys(...)` passando **o mesmo pacote** que o bot usa. |
| Figurinha chega **sem som** | 1) Confira se o seu WhatsApp já tem o recurso (atualize o app). 2) Confira se o comando chama `figurinha()` / `sendSoundSticker()` e não `sendMessage({ sticker })`. |
| Figurinha com som não é reconhecida pelo bot | O bot procura só `stickerMessage`. Use `stickerOf(msg)`. |
| Erro com `sharp` | `npm install sharp` (no Termux: `pkg install libvips`). |
| Figurinha demora | Vídeos longos levam alguns segundos, porque o kit testa combinações para ficar nítido. Use `.s 10` para usar menos tempo. |
| `Unrecognized option 'vsync'` | É de outro código do seu bot (FFmpeg novo removeu `-vsync`). O kit não usa essa opção. |

---

## ❤️ Créditos
- Sistema adaptado e melhorado no **★彡 ASTA MD 彡★** — ★彡 GEOVANE MD 彡★ (wa.me/5575920016995)
- Estrutura do protocolo baseada em análises públicas de mensagens do WhatsApp e no projeto NEO-BOT (github.com/nabilboubakri23-del/NEO-BOT)

Pode usar e compartilhar. Só mantenha os créditos 🙏
