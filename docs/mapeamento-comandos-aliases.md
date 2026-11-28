# Mapeamento completo de comandos e aliases

Gerado em 2026-11-28T17:24:20.226Z. Inventário somente leitura baseado em src/commands, no loader e nos menus atuais.

## Resumo

- Arquivos de comando: **382**
- Aliases declarados, sem repetição: **664**
- Aliases efetivamente carregados: **664**
- Arquivos de menu: **11**
- Conflitos de alias: **0**
- Erros de carregamento: **0**

## Comandos por categoria e arquivo

### admin (100 arquivos)

| Arquivo | Alias principal | Aliases | Descrição |
|---|---|---|---|
| `src/commands/admin/abrir.js` | `abrir` | `abrir`, `a`, `agp`, `abrirgp` | Abre o grupo |
| `src/commands/admin/aceitar.js` | `aceitar` | `aceitar` | Aceita TODOS os pedidos de entrada pendentes |
| `src/commands/admin/add_ddd.js` | `add_ddd` | `add_ddd` | Adiciona um DDD à lista de bloqueio do grupo |
| `src/commands/admin/add_prefixo.js` | `add_prefixo` | `add_prefixo`, `addprefixo` | Adiciona um prefixo extra para o grupo |
| `src/commands/admin/addr.js` | `addr` | `addr` | Cadastra uma resposta automática por palavra ou frase |
| `src/commands/admin/adv.js` | `adv` | `adv`, `advertir` | Adverte um usuário |
| `src/commands/admin/antiaudio.js` | `antiaudio` | `antiaudio` | Anti-Áudio (impede o envio de áudios) |
| `src/commands/admin/antibtm.js` | `antibtm` | `antibtm`, `antibtn` | Anti-BTN (bloqueia botões nativos suspeitos) |
| `src/commands/admin/anticatalogo.js` | `anticatalogo` | `anticatalogo` | Anti-Catálogo (bloqueia mensagens de catálogo) |
| `src/commands/admin/anticontato.js` | `anticontato` | `anticontato` | Anti-Contato (bloqueia envio de cartões de contato) |
| `src/commands/admin/antidd.js` | `antidd` | `antidd`, `antidd-list` | Anti-DDD (bloqueia números com DDDs específicos) |
| `src/commands/admin/antidoc.js` | `antidoc` | `antidoc` | Anti-Documento (bloqueia PDFs, Word, etc) |
| `src/commands/admin/antidocumento.js` | `antidocumento` | `antidocumento` | Anti-Documento (bloqueia arquivos) |
| `src/commands/admin/antifake.js` | `antifake` | `antifake` | Anti-Fake (bloqueia números suspeitos) |
| `src/commands/admin/antiflood.js` | `antiflood` | `antiflood` | Ativa/desativa a proteção contra excesso de mensagens |
| `src/commands/admin/antiimg.js` | `antiimg` | `antiimg` | Anti-Imagem (impede o envio de fotos) |
| `src/commands/admin/antiligacao.js` | `antiligacao` | `antiligacao`, `anti-call`, `anticall` | Anti-Ligação (bloqueia chamadas no grupo) |
| `src/commands/admin/antilink.js` | `antilink` | `antilink`, `antilinkgp` | Controle anti-link |
| `src/commands/admin/antilinkeasyon.js` | `antilinkeasyon` | `antilinkeasyon`, `antilinkeary` | Anti-Link Easy (apenas aviso e remoção) |
| `src/commands/admin/antilinkhard.js` | `antilinkhard` | `antilinkhard` | Anti-Link Hard (punição severa para links) |
| `src/commands/admin/antinotas.js` | `antinotas` | `antinotas`, `antinota` | Anti-Notas (bloqueia mensagens de nota no grupo) |
| `src/commands/admin/antipalavra.js` | `antipalavra` | `antipalavra`, `antipalavrao`, `antipalavrão` | Anti-Palavra (bloqueia palavras de baixo calão) |
| `src/commands/admin/antipay.js` | `antipay` | `antipay`, `antipagamento` | Anti-Pay (bloqueia pedidos de pagamento no grupo) |
| `src/commands/admin/antispam.js` | `antispam` | `antispam` | Ativa/desativa a proteção contra mensagens repetidas |
| `src/commands/admin/antistatus.js` | `antistatus` | `antistatus`, `anti-status` | Anti-Status (bloqueia marcações de status no grupo) |
| `src/commands/admin/antisticker.js` | `antisticker` | `antisticker` | Anti-Figurinha (impede o envio de stickers) |
| `src/commands/admin/antitrava.js` | `antitrava` | `antitrava`, `antitravas` | Anti-Trava (bloqueia mensagens de texto que travam o WhatsApp) |
| `src/commands/admin/antivideo.js` | `antivideo` | `antivideo` | Anti-Vídeo (impede o envio de vídeos) |
| `src/commands/admin/ativarresposta.js` | `ativarresposta` | `ativarresposta`, `ativarrespostas`, `ligarresposta` | Ativa uma resposta automática do grupo |
| `src/commands/admin/autofigu.js` | `autofigu` | `autofigu` | Reenvia figurinhas recebidas com a legenda configurada |
| `src/commands/admin/autorepo.js` | `autorepo` | `autorepo` | Ativa/desativa auto-reply em mídias recebidas |
| `src/commands/admin/autosticker.js` | `autosticker` | `autosticker` | Converte imagens/vídeos automaticamente em figurinhas (vídeos podem manter o som) |
| `src/commands/admin/autototext.js` | `autototext` | `autototext` | Transcreve áudios automaticamente (requer API) |
| `src/commands/admin/ban.js` | `ban` | `ban` | Remove usuário do grupo |
| `src/commands/admin/banfake.js` | `banfake` | `banfake` | Remove números fakes/estrangeiros (ignora foto de perfil) |
| `src/commands/admin/banghost.js` | `banghost` | `banghost` | Remove membros que não possuem conta válida no WhatsApp |
| `src/commands/admin/bemvindo2.js` | `bemvindo2` | `bemvindo2` | Alias compatível para ativar ou desativar boas-vindas |
| `src/commands/admin/cancelarlembrete.js` | `cancelarlembrete` | `cancelarlembrete`, `removerlembrete` | Cancela um lembrete pendente do grupo |
| `src/commands/admin/checkativo.js` | `checkativo` | `checkativo` | Mostra o perfil de XP de um membro |
| `src/commands/admin/configresposta.js` | `configresposta` | `configresposta`, `configurarresposta` | Configura prioridade e cooldown de uma resposta automática |
| `src/commands/admin/del_ddd.js` | `del_ddd` | `del_ddd` | Remove um DDD da lista de bloqueio do grupo |
| `src/commands/admin/delr.js` | `delr` | `delr` | Remove uma resposta automática por palavra ou frase |
| `src/commands/admin/desativarresposta.js` | `desativarresposta` | `desativarresposta`, `desativarrespostas`, `desligarresposta` | Desativa uma resposta automática sem removê-la |
| `src/commands/admin/descgp.js` | `descgp` | `descgp` | Consulta ou altera a descrição do grupo |
| `src/commands/admin/editarresposta.js` | `editarresposta` | `editarresposta`, `editarrespostas`, `editresposta` | Edita uma resposta automática do grupo |
| `src/commands/admin/ephemeral.js` | `ephemeral` | `ephemeral` | Ativa/desativa mensagens temporárias |
| `src/commands/admin/fechar.js` | `fechar` | `fechar`, `f`, `fgp`, `fechargp` | Fecha o grupo |
| `src/commands/admin/infobemvindo.js` | `infobemvindo` | `infobemvindo`, `infobv` | Mostra as configurações de boas-vindas |
| `src/commands/admin/infogrupo.js` | `infogrupo` | `infogrupo`, `grupo`, `grupoinfo`, `infogp` | Informações do grupo |
| `src/commands/admin/kick.js` | `kick` | `kick` | Remove usuário do grupo |
| `src/commands/admin/legenda_documento.js` | `legenda_documento` | `legenda_documento`, `legendadoc` | Define a legenda padrão para documentos |
| `src/commands/admin/legenda_estrangeiro.js` | `legenda_estrangeiro` | `legenda_estrangeiro`, `legendaestrangeiro` | Define a legenda para números estrangeiros |
| `src/commands/admin/legenda_imagem.js` | `legenda_imagem` | `legenda_imagem`, `legendaimg` | Define a legenda padrão para imagens |
| `src/commands/admin/legenda_video.js` | `legenda_video` | `legenda_video`, `legendavid` | Define a legenda padrão para vídeos |
| `src/commands/admin/legendabv.js` | `legendabv` | `legendabv` | Define a legenda de boas-vindas |
| `src/commands/admin/legendabv2.js` | `legendabv2` | `legendabv2` | Alias compatível para configurar a legenda de boas-vindas |
| `src/commands/admin/legendasaiu.js` | `legendasaiu` | `legendasaiu`, `legendasaida` | Define a legenda de despedida |
| `src/commands/admin/legendasaiu2.js` | `legendasaiu2` | `legendasaiu2` | Alias compatível para configurar a legenda de saída |
| `src/commands/admin/lembretesgrupo.js` | `lembretesgrupo` | `lembretesgrupo`, `listarlembretes`, `listarlembretesgrupo` | Lista os lembretes pendentes do grupo |
| `src/commands/admin/limite_caracteres.js` | `limite_caracteres` | `limite_caracteres`, `limitecaracteres`, `limite_letras` | Define o limite máximo de caracteres nas mensagens do grupo |
| `src/commands/admin/limpar.js` | `limpar` | `limpar` | Limpa o histórico do grupo (Método Takeshi) |
| `src/commands/admin/limparlembretes.js` | `limparlembretes` | `limparlembretes`, `limparembretes` | Remove todos os lembretes pendentes do grupo |
| `src/commands/admin/link.js` | `link` | `link`, `linkgrupo`, `linkgp`, `linkgroup` |  |
| `src/commands/admin/listaadmins.js` | `listaadmins` | `listaadmins`, `admins`, `adms` | Lista todos os administradores do grupo |
| `src/commands/admin/listanegrag.js` | `listanegrag` | `listanegrag`, `listanegra`, `verblacklistgp` | Lista os números na lista negra deste grupo |
| `src/commands/admin/listarrespostas.js` | `listarrespostas` | `listarrespostas`, `listarespostas` | Lista as respostas automáticas do grupo atual |
| `src/commands/admin/msgtemp.js` | `msgtemp` | `msgtemp` | Define o tempo das mensagens temporárias (exige ephemeral ativo) |
| `src/commands/admin/mudarftgp.js` | `mudarftgp` | `mudarftgp` | Altera a foto do grupo |
| `src/commands/admin/mute.js` | `mute` | `mute` | Muta um usuário |
| `src/commands/admin/mute2.js` | `mute2` | `mute2` | Muta um usuário por um tempo específico (ex: 10m, 1h) |
| `src/commands/admin/mutelist.js` | `mutelist` | `mutelist` | Lista os usuários mutados no grupo |
| `src/commands/admin/nomegp.js` | `nomegp` | `nomegp` | Consulta ou altera o nome do grupo |
| `src/commands/admin/odelete.js` | `odelete` | `odelete` | Ativa/desativa exclusão automática de mensagens |
| `src/commands/admin/prefixos.js` | `prefixos` | `prefixos`, `meusprefixos` | Lista todos os prefixos do grupo |
| `src/commands/admin/promover.js` | `promover` | `promover`, `promote` | Promove usuário a administrador |
| `src/commands/admin/rank.js` | `rank` | `rank`, `ranking` | Mostra ranking de XP do grupo |
| `src/commands/admin/rebaixar.js` | `rebaixar` | `rebaixar`, `demote` | Remove administrador |
| `src/commands/admin/recusar.js` | `recusar` | `recusar` | Recusa TODOS os pedidos de entrada pendentes |
| `src/commands/admin/regras.js` | `regras` | `regras` | Consulta as regras definidas na descrição do grupo |
| `src/commands/admin/regraspp.js` | `regraspp` | `regraspp`, `regraspv` | Envia as regras do grupo no privado |
| `src/commands/admin/revlinkgp.js` | `revlinkgp` | `revlinkgp`, `revlinkgroup` | Revoga o link do grupo |
| `src/commands/admin/rmadv.js` | `rmadv` | `rmadv`, `removeradv`, `tiraradv` |  |
| `src/commands/admin/rmphotogp.js` | `rmphotogp` | `rmphotogp`, `removerfotogp` | Remove a foto do grupo |
| `src/commands/admin/s.js` | `s` | `s` | Marca o grupo e envia a enquete. |
| `src/commands/admin/savegp.js` | `savegp` | `savegp`, `salvarlink`, `salvarlinkgp` | Salva o link atual do grupo no banco de dados (Apenas Dono) |
| `src/commands/admin/soadm.js` | `soadm` | `soadm`, `so_adm` | Ativa ou desativa comandos públicos |
| `src/commands/admin/solicitacao.js` | `solicitacao` | `solicitacao` | Ativa/desativa a aprovação de entrada no grupo |
| `src/commands/admin/status.js` | `status` | `status` | Mostra configurações completas do grupo e informações do bot |
| `src/commands/admin/tempocmd.js` | `tempocmd` | `tempocmd`, `tempo_comando` | Define o tempo de espera (cooldown) entre comandos |
| `src/commands/admin/testarresposta.js` | `testarresposta` | `testarresposta`, `testarrespostas` | Simula uma mensagem contra as respostas automáticas do grupo |
| `src/commands/admin/testebv.js` | `testebv` | `testebv` | Testa a mensagem de boas-vindas |
| `src/commands/admin/tirar_prefixo.js` | `tirar_prefixo` | `tirar_prefixo`, `tirarprefixo`, `rm_prefixo` | Remove um prefixo extra do grupo |
| `src/commands/admin/totag.js` | `totag` | `totag`, `t`, `hidetag` | Envia mensagem marcando todos |
| `src/commands/admin/unmute.js` | `unmute` | `unmute`, `desmute` | Remove o mute de um usuário |
| `src/commands/admin/warnings.js` | `warnings` | `warnings`, `advertencias`, `advlist` | Lista advertências do usuário |
| `src/commands/admin/welcome.js` | `welcome` | `welcome`, `bemvindo` | Ativa ou desativa boas vindas |
| `src/commands/admin/x.js` | `x` | `x` | Marca o grupo e envia a enquete XGRUPO. |
| `src/commands/admin/x9visuunica.js` | `x9visuunica` | `x9visuunica` | Ativa/desativa captura de visualização única |
| `src/commands/admin/xp.js` | `xp` | `xp` | Ativa ou desativa o ganho de XP no grupo |
| `src/commands/admin/zerarativos.js` | `zerarativos` | `zerarativos`, `zerarxp`, `resetxp` | Zera o XP de todos os membros deste grupo |

### ia (10 arquivos)

| Arquivo | Alias principal | Aliases | Descrição |
|---|---|---|---|
| `src/commands/ia/claude.js` | `claude` | `claude`, `cloude` | Conversa com Claude |
| `src/commands/ia/conversa.js` | `` |  |  |
| `src/commands/ia/flux.js` | `flux` | `flux`, `fluximg` | Gera uma imagem em alta qualidade |
| `src/commands/ia/gemini.js` | `gemini` | `gemini`, `ia`, `deepseek` | Conversa com o Gemini e mantém compatibilidade com aliases antigos |
| `src/commands/ia/gpt.js` | `gpt` | `gpt` | Conversa com um modelo rápido servido pela Groq |
| `src/commands/ia/ia-sticker.js` | `ia-sticker` | `ia-sticker`, `iasticker`, `iafig`, `figia` | Gera uma figurinha usando Inteligência Artificial |
| `src/commands/ia/imagine.js` | `imagine` | `imagine`, `gerarimg`, `desenhar` | Gera uma imagem usando Inteligência Artificial |
| `src/commands/ia/limparia.js` | `limparia` | `limparia` | Apaga o histórico da conversa com a IA |
| `src/commands/ia/modoia.js` | `modoia` | `modoia` | Ativa ou desativa a conversa contínua com a IA |
| `src/commands/ia/statusia.js` | `statusia` | `statusia` | Mostra o status do modo contínuo e do histórico da IA |

### member (161 arquivos)

| Arquivo | Alias principal | Aliases | Descrição |
|---|---|---|---|
| `src/commands/member/abraco.js` | `abraco` | `abraco`, `abraçar`, `abracar` | Envia um abraço virtual com GIF |
| `src/commands/member/adivinha.js` | `adivinha` | `adivinha`, `adivinhar` | Adivinhe o número que o bot pensou |
| `src/commands/member/adotar.js` | `adotar` | `adotar`, `adotarfilho` | Adota alguém como filho no seu casamento |
| `src/commands/member/aliases_play_audio.js` | `playaudio` | `playaudio`, `playdoc`, `ytmp3` |  |
| `src/commands/member/aliases_redes_audio.js` | `tiktok_audio` | `tiktok_audio`, `tiktok_audio2`, `insta_audio`, `insta_audio2`, `face_audio`, `twitter_audio` |  |
| `src/commands/member/aliases_video.js` | `playvid` | `playvid`, `playvideo`, `playmp4` |  |
| `src/commands/member/amazon.js` | `amazon` | `amazon` | Normaliza links e pesquisas da Amazon Brasil |
| `src/commands/member/amazonsearch.js` | `amazonsearch` | `amazonsearch` | Pesquisa produtos na Amazon Brasil |
| `src/commands/member/amigo.js` | `amigo` | `amigo`, `amizade`, `melhoresamigos` | Calcula a porcentagem de amizade entre duas pessoas |
| `src/commands/member/anagrama.js` | `anagrama` | `anagrama` | Jogo de descobrir a palavra embaralhada |
| `src/commands/member/aptoide.js` | `aptoide` | `aptoide` | Busca aplicativos na Aptoide |
| `src/commands/member/atividade.js` | `atividade` | `atividade` | Atalho para o perfil de atividade |
| `src/commands/member/attp.js` | `attp` | `attp` | Cria uma figurinha com texto neon animado |
| `src/commands/member/audiodoc.js` | `audiodoc` | `audiodoc`, `audio_documento`, `audio2doc` | Envia um áudio citado como documento |
| `src/commands/member/avaliar.js` | `avaliar` | `avaliar`, `feedback` | Envia uma avaliação para o dono do bot |
| `src/commands/member/baiano.js` | `baiano` | `baiano`, `baiana` | Zoeira regional |
| `src/commands/member/baixar_audio.js` | `baixar_audio_interno` | `baixar_audio_interno` | Baixa o áudio de um link |
| `src/commands/member/beijo.js` | `beijo` | `beijo`, `beijar` | Envia um beijo virtual com GIF |
| `src/commands/member/beta.js` | `beta` | `beta` | Chama alguém de beta |
| `src/commands/member/book.js` | `book` | `book`, `livro` | Busca informações de um livro |
| `src/commands/member/brat.js` | `brat` | `brat`, `brat1`, `brat3`, `brat4`, `bratteste` | Cria uma figurinha estilo Brat localmente |
| `src/commands/member/brat2.js` | `brat2` | `brat2` | Cria uma figurinha animada estilo Brat (texto por partes) |
| `src/commands/member/bratvideo.js` | `bratvideo` | `bratvideo`, `bratv`, `bratvteste` | Cria uma figurinha animada estilo Brat |
| `src/commands/member/calc.js` | `calc` | `calc`, `calcular`, `conta` | Calculadora matemática |
| `src/commands/member/cantada.js` | `cantada` | `cantada`, `cantadas` | Envia uma cantada leve |
| `src/commands/member/caraoucoroa.js` | `caraoucoroa` | `caraoucoroa` | Joga cara ou coroa |
| `src/commands/member/carinho.js` | `carinho` | `carinho`, `cafune`, `afago` | Envia um carinho virtual com GIF |
| `src/commands/member/carioca.js` | `carioca` | `carioca`, `paulista`, `mineiro` | Zoação regional |
| `src/commands/member/cep.js` | `cep` | `cep` | Busca o endereço de um CEP |
| `src/commands/member/chance.js` | `chance` | `chance` | Calcula a chance de algo dar certo |
| `src/commands/member/circulo.js` | `circulo` | `circulo`, `redonda` | Cria ou refaz uma figurinha redonda, mantendo o som quando disponível |
| `src/commands/member/clima.js` | `clima` | `clima`, `tempo` | Mostra a previsão do tempo de uma cidade |
| `src/commands/member/compatibilidade.js` | `compatibilidade` | `compatibilidade`, `compativel` | Calcula a compatibilidade entre duas pessoas |
| `src/commands/member/conselho.js` | `conselho` | `conselho`, `conselhos` | Envia um conselho aleatório |
| `src/commands/member/conselhosbiblicos.js` | `conselhosbilbicos` | `conselhosbilbicos` | Envia um conselho bíblico aleatório |
| `src/commands/member/contardias.js` | `contardias` | `contardias`, `dias` | Mostra quantos dias o usuário tem registrado no bot |
| `src/commands/member/contato.js` | `contato` | `contato`, `vcard`, `vcf` | Gera um contato vCard |
| `src/commands/member/dado.js` | `dado` | `dado` | Lança um dado de seis faces |
| `src/commands/member/dado2.js` | `dado2` | `dado2` | Lança dois dados de seis faces |
| `src/commands/member/dadoapostado.js` | `dadoapostado` | `dadoapostado` | Aposta no resultado de um dado |
| `src/commands/member/ddd.js` | `ddd` | `ddd` | Busca o estado e cidades de um DDD |
| `src/commands/member/donos.js` | `donos` | `donos`, `owners` | Lista os donos do bot |
| `src/commands/member/duelo.js` | `duelo` | `duelo`, `batalha` | Desafie alguém para um duelo |
| `src/commands/member/emoji.js` | `emoji` | `emoji` | Sugere emojis por categoria |
| `src/commands/member/encurtalink.js` | `encurtalink` | `encurtalink` | Encurta um link |
| `src/commands/member/enigma.js` | `enigma` | `enigma`, `charada` | Jogo de adivinhação |
| `src/commands/member/enquete.js` | `enquete` | `enquete`, `poll` | Cria uma enquete nativa do WhatsApp |
| `src/commands/member/eununca.js` | `eununca` | `eununca` | Sorteia uma frase de Eu Nunca em formato de enquete |
| `src/commands/member/facebook.js` | `facebook` | `facebook`, `fb`, `face`, `face_video` | Baixa vídeos do Facebook via link |
| `src/commands/member/familia.js` | `familia` | `familia`, `minhafamilia` | Mostra a árvore genealógica da sua família |
| `src/commands/member/fancy.js` | `fancy` | `fancy`, `font` | Transforma o texto em letras estilizadas |
| `src/commands/member/fazernick.js` | `fazernick` | `fazernick` | Gera apelidos estilizados |
| `src/commands/member/fiel.js` | `fiel` | `fiel`, `infiel` | Testa a fidelidade de alguém |
| `src/commands/member/fig.js` | `fig` | `fig`, `sticker`, `st`, `fsticker`, `figvideo`, `stk` | Cria figurinha de imagem, vídeo ou áudio; mantém o som quando disponível |
| `src/commands/member/figfundo.js` | `figfundo` | `figfundo`, `figusemfundo`, `removebg` | Remove o fundo de uma imagem e cria uma figurinha |
| `src/commands/member/figperfil.js` | `figperfil` | `figperfil` | Transforma a foto de perfil em figurinha |
| `src/commands/member/figuweb.js` | `figuweb` | `figuweb` | Cria uma figurinha a partir de uma imagem da web |
| `src/commands/member/forca.js` | `forca` | `forca` | Jogo da forca |
| `src/commands/member/frase.js` | `frase` | `frase` | Envia uma frase aleatória |
| `src/commands/member/gartic.js` | `gartic` | `gartic` | Sorteia um desafio de desenho do Gartic |
| `src/commands/member/gerarcpf.js` | `gerarcpf` | `gerarcpf` | Gera um CPF válido apenas para testes |
| `src/commands/member/gerarlink.js` | `gerarlink` | `gerarlink` | Gera um link público para uma mídia respondida |
| `src/commands/member/getbio.js` | `getbio` | `getbio` | Mostra a biografia/status do WhatsApp |
| `src/commands/member/getperfil.js` | `getperfil` | `getperfil` | Busca a foto de perfil de um usuário |
| `src/commands/member/gostoso.js` | `gostoso` | `gostoso`, `gostosa` | Faz um elogio ousado |
| `src/commands/member/gruposwhatsapp.js` | `gruposwhatsapp` | `gruposwhatsapp` | Busca links públicos de grupos do WhatsApp |
| `src/commands/member/gtts.js` | `gtts` | `gtts` | Converte texto em áudio |
| `src/commands/member/idade.js` | `idade` | `idade` | Calcula a idade pela data de nascimento |
| `src/commands/member/idfig.js` | `idfig` | `idfig` | Identifica uma figurinha pelo hash |
| `src/commands/member/imdb.js` | `imdb` | `imdb` | Pesquisa filmes e títulos no IMDb |
| `src/commands/member/imdbinfo.js` | `imdbinfo` | `imdbinfo` | Mostra detalhes de um título do IMDb |
| `src/commands/member/imgfiltro.js` | `imgfiltro` | `imgfiltro`, `filtro` | Aplica filtros em imagens ou figurinhas |
| `src/commands/member/infobot.js` | `infobot` | `infobot` | Mostra informações técnicas do bot |
| `src/commands/member/infodono.js` | `infodono` | `infodono`, `donoinfo` | Mostra o contato do dono do bot |
| `src/commands/member/instagram.js` | `instagram` | `instagram`, `insta`, `ig`, `reels`, `instagram2`, `insta_video2` | Baixa vídeos e fotos do Instagram via link |
| `src/commands/member/ip.js` | `ip` | `ip`, `ipinfo` | Busca informações de um IP |
| `src/commands/member/jogodavelha.js` | `jogodavelha` | `jogodavelha`, `velha` | Joga o clássico Jogo da Velha contra outro membro |
| `src/commands/member/kwai.js` | `kwai` | `kwai` | Baixa vídeos do Kwai |
| `src/commands/member/lembrete.js` | `lembrete` | `lembrete`, `lembrar`, `timer` | Cria e gerencia lembretes persistentes |
| `src/commands/member/lermais.js` | `lermais` | `lermais` | Envia um texto no formato Leia mais |
| `src/commands/member/letra.js` | `letra` | `letra`, `letramusic` | Busca a letra de uma música |
| `src/commands/member/lindo.js` | `lindo` | `lindo`, `linda` | Elogia a beleza de alguém |
| `src/commands/member/louco.js` | `louco` | `louco`, `louca` | Chama alguém de louco |
| `src/commands/member/maisusados.js` | `maisusados` | `maisusados`, `topcomandos` | Mostra os 3 comandos mais usados no grupo |
| `src/commands/member/matematica.js` | `matematica` | `matematica` | Calcula uma operação matemática simples |
| `src/commands/member/mediafire.js` | `mediafire` | `mediafire` | Baixa um arquivo público do MediaFire |
| `src/commands/member/meme.js` | `meme` | `meme`, `memes` | Envia um meme aleatório |
| `src/commands/member/meumelhoramigo.js` | `meumelhoramigo` | `meumelhoramigo`, `meumelhorpar`, `bff` | Define ou mostra seu melhor amigo no bot |
| `src/commands/member/meunome.js` | `meunome` | `meunome`, `nome` | Mostra o nome registrado de um usuário no bot |
| `src/commands/member/meunumero.js` | `meunumero` | `meunumero`, `numeroid`, `meuid` | Mostra o número e ID do usuário |
| `src/commands/member/meusigno.js` | `meusigno` | `meusigno`, `signoregistro` | Descobre o signo do usuário baseado no registro |
| `src/commands/member/minhadupla.js` | `minhadupla` | `minhadupla`, `dupla`, `meupar`, `meucasal`, `casal` | Mostra informações sobre o seu relacionamento |
| `src/commands/member/motivacao.js` | `motivacao` | `motivacao` | Envia uma mensagem motivacional |
| `src/commands/member/movie.js` | `movie` | `movie`, `filme` | Busca informações de um filme |
| `src/commands/member/namorar.js` | `namorar` | `namorar`, `casar` | Envia um pedido de namoro para alguém |
| `src/commands/member/nexraybrat.js` | `nexraybrat` | `nexraybrat` | Cria uma figurinha Brat usando a NexRay API |
| `src/commands/member/noticias.js` | `noticias` | `noticias`, `gnews`, `getnoticias`, `googlenews` | Mostra as últimas notícias do G1 |
| `src/commands/member/obesidade.js` | `obesidade` | `obesidade` | Calcula o índice de massa corporal |
| `src/commands/member/off.js` | `off` | `off`, `afk` | Registra ausência temporária |
| `src/commands/member/on.js` | `on` | `on` | Encerra a ausência |
| `src/commands/member/perfil.js` | `perfil` | `perfil`, `perfil2`, `profile` | Mostra perfil do usuário |
| `src/commands/member/piada.js` | `piada` | `piada` | Envia uma piada curta |
| `src/commands/member/ping.js` | `ping` | `ping` | Teste de resposta |
| `src/commands/member/pinterest.js` | `pinterest` | `pinterest`, `pin` | Baixa vídeos e imagens do Pinterest |
| `src/commands/member/play_opcao.js` | `play_opcao_interno` | `play_opcao_interno` | Processa as opções internas do menu Play |
| `src/commands/member/play.js` | `play` | `play`, `ytplay`, `playmusic` | Pesquisa músicas no YouTube usando a KnightBot API |
| `src/commands/member/playstore.js` | `playstore` | `playstore`, `app` | Busca um aplicativo na Play Store |
| `src/commands/member/ppt.js` | `ppt` | `ppt` | Joga pedra, papel e tesoura |
| `src/commands/member/qc.js` | `qc` | `qc` | Cria uma figurinha com uma mensagem citada |
| `src/commands/member/qrcode.js` | `qrcode` | `qrcode`, `qr` | Gera um QR Code de um texto ou link |
| `src/commands/member/quiz.js` | `quiz` | `quiz` | Inicia um quiz de perguntas |
| `src/commands/member/quizanimais.js` | `quizanimais` | `quizanimais` | Inicia um quiz sobre animais |
| `src/commands/member/quizfutebol.js` | `quizfutebol` | `quizfutebol` | Inicia um quiz sobre futebol |
| `src/commands/member/rankativos.js` | `rankativos` | `rankativos`, `rankativo` | Atalho para o ranking de XP |
| `src/commands/member/rankengracado.js` | `rankengracado` | `rankengracado` | Ranking dos mais engraçados do grupo |
| `src/commands/member/rankfofo.js` | `rankfofo` | `rankfofo` | Ranking dos mais fofos do grupo |
| `src/commands/member/rankgado.js` | `rankgado` | `rankgado` | Ranking dos mais gados do grupo |
| `src/commands/member/rankgay.js` | `rankgay` | `rankgay` | Ranking dos mais gays do grupo |
| `src/commands/member/rankinteligente.js` | `rankinteligente` | `rankinteligente` | Ranking dos mais inteligentes do grupo |
| `src/commands/member/rankparceiro.js` | `rankparceiro` | `rankparceiro` | Ranking dos melhores parceiros do grupo |
| `src/commands/member/ranksortudo.js` | `ranksortudo` | `ranksortudo` | Ranking dos mais sortudos do grupo |
| `src/commands/member/resetvelha.js` | `resetvelha` | `resetvelha`, `resetarvelha` | Encerra a partida ativa de jogo da velha |
| `src/commands/member/responda.js` | `responda` | `responda` | Responde uma pergunta aleatoriamente |
| `src/commands/member/revelarenigma.js` | `revelarenigma` | `revelarenigma` | Revela a resposta do enigma ativo |
| `src/commands/member/roletarussa.js` | `roletarussa` | `roletarussa` | Brincadeira aleatória de roleta russa virtual |
| `src/commands/member/safado.js` | `safado` | `safado`, `safada` | Chama alguém de safado |
| `src/commands/member/saudio.js` | `saudio` | `saudio` | Cria figurinha com som a partir de áudio ou vídeo |
| `src/commands/member/serie.js` | `serie` | `serie`, `series` | Pesquisa séries no IMDb |
| `src/commands/member/shazam.js` | `shazam` | `shazam`, `qualemusica` | Reconhece a música de um áudio |
| `src/commands/member/ship.js` | `ship` | `ship`, `shipar`, `shippar`, `shipo` | Calcula a compatibilidade de amor entre duas pessoas |
| `src/commands/member/sigma.js` | `sigma` | `sigma` | Chama alguém de sigma |
| `src/commands/member/signo.js` | `signo` | `signo` | Descobre o signo baseado na data |
| `src/commands/member/simi.js` | `simi` | `simi`, `simisimi` | Conversa com a SimiSimi pela NexRay |
| `src/commands/member/slot.js` | `slot` | `slot`, `cassino`, `apostar` | Aposte seu XP no caça-níqueis |
| `src/commands/member/somfig.js` | `somfig` | `somfig` | Extrai o áudio de uma figurinha com som e envia como nota de voz |
| `src/commands/member/sorte.js` | `sorte` | `sorte` | Escolhe uma opção aleatória |
| `src/commands/member/sorteio.js` | `sorteio` | `sorteio` | Sorteia um membro do grupo |
| `src/commands/member/soundcloud.js` | `soundcloud` | `soundcloud`, `sc` | Baixa músicas (motor rápido) |
| `src/commands/member/spoiler.js` | `spoiler` | `spoiler` | Envia um texto oculto como spoiler |
| `src/commands/member/spotify.js` | `spotify` | `spotify`, `spotifyplay` | Baixa uma música do Spotify usando o YouTube |
| `src/commands/member/statusapi.js` | `statusapi` | `statusapi`, `apis` | Verifica o status das APIs do bot |
| `src/commands/member/stickerinfo.js` | `stickerinfo` | `stickerinfo`, `figinfo` | Mostra o nome e autor de uma figurinha |
| `src/commands/member/stmetadata.js` | `stmetadata` | `stmetadata` | Mostra os metadados de uma figurinha |
| `src/commands/member/tabela.js` | `tabela` | `tabela` | Gera a tabuada de um número |
| `src/commands/member/tagme.js` | `tagme` | `tagme`, `mytag` | Menciona o próprio usuário |
| `src/commands/member/terminar.js` | `terminar` | `terminar`, `divorciar`, `separar` | Termina o relacionamento atual |
| `src/commands/member/testeload.js` | `testeload` | `testeload` | Teste do reload |
| `src/commands/member/tiktok.js` | `tiktok` | `tiktok`, `tiktok2`, `tt`, `tik`, `tk-video`, `tiktok_video`, `tiktok_video2` | Baixa um vídeo do TikTok via link |
| `src/commands/member/tk.js` | `tk` | `tk`, `take`, `roubar` | Renomeia uma figurinha citada com o nome do executor, mantendo o som |
| `src/commands/member/togif.js` | `togif` | `togif` | Converte uma figurinha em GIF; quando contém som, envia vídeo MP4 com áudio |
| `src/commands/member/toimg.js` | `toimg` | `toimg`, `toimage` | Converte uma figurinha em imagem |
| `src/commands/member/totext.js` | `totext` | `totext` | Converte áudio em texto offline |
| `src/commands/member/traduzir.js` | `traduzir` | `traduzir` | Traduz um texto para outro idioma |
| `src/commands/member/ttps.js` | `ttps` | `ttps` | Cria uma figurinha a partir de texto |
| `src/commands/member/twitter.js` | `twitter` | `twitter`, `xvideo`, `twitter_video` | Baixa vídeos do Twitter/X via link |
| `src/commands/member/vcprefere.js` | `vcprefere` | `vcprefere` | Faz uma enquete de Você Prefere |
| `src/commands/member/verdadeoudesafio.js` | `verdadeoudesafio` | `verdadeoudesafio` | Escolhe entre verdade e desafio |
| `src/commands/member/wame.js` | `wame` | `wame` | Gera um link wa.me |
| `src/commands/member/wikipedia.js` | `wiki` | `wiki`, `wikipedia` | Busca um resumo na Wikipedia |
| `src/commands/member/ytmp4.js` | `ytmp4` | `ytmp4`, `video`, `ytvideo`, `baixarvideo` | Baixa um vídeo do YouTube via link e envia no chat |
| `src/commands/member/ytsearch.js` | `ytsearch` | `ytsearch`, `buscar` | Pesquisa vídeos no YouTube e retorna uma lista |

### menu (14 arquivos)

| Arquivo | Alias principal | Aliases | Descrição |
|---|---|---|---|
| `src/commands/menu/criador.js` | `criador` | `criador`, `dev`, `suporte` | Mostra o contato do criador |
| `src/commands/menu/efeitosimg.js` | `efeitosimg` | `efeitosimg`, `efeitos` | Mostra o menu de efeitos de imagem |
| `src/commands/menu/menu.js` | `menu` | `menu`, `help` | Menu principal do bot |
| `src/commands/menu/menuadm.js` | `menuadm` | `menuadm` | Menu administrativo |
| `src/commands/menu/menubrincadeiras.js` | `menubrincadeiras` | `menubrincadeiras`, `menubn` | Menu brincadeiras |
| `src/commands/menu/menucons.js` | `menucons` | `menucons`, `consmenu` | Mostra o menu de consultas |
| `src/commands/menu/menudono.js` | `menudono` | `menudono` | Menu do dono |
| `src/commands/menu/menudownload.js` | `menudownload` | `menudownload` | Menu downloads |
| `src/commands/menu/menuia.js` | `menuia` | `menuia` | Menu inteligência artificial |
| `src/commands/menu/menuprincipal.js` | `menuprincipal` | `menuprincipal` | Mostra o menu com todos os comandos |
| `src/commands/menu/menurank.js` | `menurank` | `menurank`, `rankmenu` | Mostra o menu de rankings |
| `src/commands/menu/menuref.js` | `menuref` | `menuref` | Teste do menu referência |
| `src/commands/menu/menustaff.js` | `menustaff` | `menustaff`, `staffmenu` | Mostra o menu de Staff |
| `src/commands/menu/menuteste.js` | `menuteste` | `menuteste` | Teste do menu Native Flow single_select |

### owner (97 arquivos)

| Arquivo | Alias principal | Aliases | Descrição |
|---|---|---|---|
| `src/commands/owner/addall.js` | `addall` | `addall` | Adiciona membros de outro grupo ao grupo atual |
| `src/commands/owner/addcmdvip.js` | `addcmdvip` | `addcmdvip` | Marca um comando como exclusivo para VIPs |
| `src/commands/owner/addperm.js` | `addperm` | `addperm` | Dá permissão a um usuário para usar um comando específico |
| `src/commands/owner/addrc.js` | `addrc` | `addrc` | Cadastra uma reação automática global (em todos os grupos) |
| `src/commands/owner/addvip.js` | `addvip` | `addvip` | Adiciona um usuário à lista VIP local |
| `src/commands/owner/admin.js` | `admin` | `admin` | Painel informativo de administração |
| `src/commands/owner/allgp.js` | `allgp` | `allgp`, `allgroups`, `grupos` | Gerencia e lista os grupos onde o bot está |
| `src/commands/owner/aluguel.js` | `aluguel` | `aluguel`, `alugar` | Registra o grupo atual por uma duração definida |
| `src/commands/owner/animacoes.js` | `animacoes` | `animacoes` | Lista o estado básico das animações dos menus |
| `src/commands/owner/aniversario-global.js` | `aniversario-global` | `aniversario-global`, `aniversarioglobal` | Gerencia o sistema de aniversários globais |
| `src/commands/owner/anti-arqv.js` | `anti-arqv` | `anti-arqv`, `antiarqv` | Ativa/desativa a proteção contra promoção de administradores sem autorização |
| `src/commands/owner/antipv.js` | `antipv` | `antipv` | Avisar sobre uso do bot no privado |
| `src/commands/owner/antipv2.js` | `antipv2` | `antipv2` | Bloquear comandos no privado |
| `src/commands/owner/antipv3.js` | `antipv3` | `antipv3` | Bloquear mensagens privadas de não donos |
| `src/commands/owner/ativadms.js` | `ativadms` | `ativadms` | Mostra administradores e quantidade de comandos usados |
| `src/commands/owner/audio-menu.js` | `audio-menu` | `audio-menu`, `audiomenu` | Define o áudio reproduzido antes do menu administrativo |
| `src/commands/owner/backup.js` | `backup` | `backup`, `salvarconfig` | Envia um backup das configurações e bancos de dados para o dono |
| `src/commands/owner/bangp.js` | `bangp` | `bangp` | Desativa o bot neste grupo |
| `src/commands/owner/blacklist.js` | `blacklist` | `blacklist`, `blocklist` | Adiciona número à lista negra do grupo |
| `src/commands/owner/blockcmd.js` | `blockcmd` | `blockcmd` | Bloqueia um comando no grupo atual |
| `src/commands/owner/blockcmdg.js` | `blockcmdg` | `blockcmdg`, `blockcmdglobal` | Bloqueia um comando globalmente |
| `src/commands/owner/blockgp.js` | `blockgp` | `blockgp` | Bloqueia o bot em um grupo |
| `src/commands/owner/blockuser.js` | `blockuser` | `blockuser` | Bloqueia usuário de interagir com o bot |
| `src/commands/owner/botinfo.js` | `botinfo` | `botinfo` | Informações do bot |
| `src/commands/owner/clearperm.js` | `clearperm` | `clearperm` | Remove todas as permissões de um usuário |
| `src/commands/owner/cmdviplist.js` | `cmdviplist` | `cmdviplist` | Lista os comandos exclusivos para VIPs |
| `src/commands/owner/consultar_vip.js` | `consultar_vip` | `consultar_vip` | Consulta o status VIP de um usuário |
| `src/commands/owner/criargp.js` | `criargp` | `criargp`, `criargrupo` | Cria um novo grupo |
| `src/commands/owner/delcmdvip.js` | `delcmdvip` | `delcmdvip` | Remove a exclusividade VIP de um comando |
| `src/commands/owner/delfig.js` | `delfig` | `delfig` | Remove uma figurinha do catálogo local |
| `src/commands/owner/delrc.js` | `delrc` | `delrc`, `delreacao`, `delreacoes` | Remove uma reação automática global |
| `src/commands/owner/delvip.js` | `delvip` | `delvip` | Remove um usuário da lista VIP local |
| `src/commands/owner/divmsg.js` | `divmsg` | `divmsg`, `divid`, `divulgar` | Envia uma mensagem para todos os grupos ou para um grupo específico |
| `src/commands/owner/divulgacao.js` | `divulgacao` | `divulgacao`, `broadcast` | Envia uma divulgação formatada para todos os grupos |
| `src/commands/owner/donogp.js` | `donogp` | `donogp` | Registra o dono responsável por promover e rebaixar membros deste grupo |
| `src/commands/owner/efeito.js` | `audioefeito` | `audioefeito` | Aplica efeitos de áudio em uma mensagem respondida |
| `src/commands/owner/entrargp.js` | `entrargp` | `entrargp`, `entrargrupo` | Faz o bot entrar em um grupo via link |
| `src/commands/owner/fotomenu.js` | `fotomenu` | `fotomenu` | Altera a imagem de um menu de categoria |
| `src/commands/owner/fundomenu.js` | `fundomenu` | `fundomenu` | Altera o fundo do cabeçalho do menu principal |
| `src/commands/owner/gestao.js` | `gestao` | `gestao` | Painel de gestão e segurança do grupo |
| `src/commands/owner/getchannel.js` | `getchannel` | `getchannel`, `getcanal` | Obtém o link ou ID de um canal |
| `src/commands/owner/getgroupid.js` | `getgroupid` | `getgroupid`, `idgrupo` | Mostra o ID do grupo |
| `src/commands/owner/gethtml.js` | `gethtml` | `gethtml` | Baixa o código HTML de um site |
| `src/commands/owner/hierarquia.js` | `hierarquia` | `hierarquia`, `hirarquia` | Mostra painel de hierarquia |
| `src/commands/owner/lista_aluguel.js` | `lista_aluguel` | `lista_aluguel` | Lista os registros locais de aluguel |
| `src/commands/owner/listafig.js` | `listafig` | `listafig` | Lista as figurinhas salvas (Owner) |
| `src/commands/owner/listarc.js` | `listarc` | `listarc`, `listarreacoes`, `listarreacao` | Lista todas as reações automáticas globais |
| `src/commands/owner/listblacklist.js` | `listblacklist` | `listblacklist`, `verblacklist` | Lista números na lista negra do grupo |
| `src/commands/owner/listblockcmd.js` | `listblockcmd` | `listblockcmd` | Lista comandos bloqueados no grupo atual |
| `src/commands/owner/listblockcmdglobal.js` | `listblockcmdglobal` | `listblockcmdglobal`, `listbcmdglobal` | Lista comandos bloqueados globalmente |
| `src/commands/owner/listblockgp.js` | `listblockgp` | `listblockgp`, `listblockgroups` | Lista grupos bloqueados |
| `src/commands/owner/listdonogp.js` | `listdonogp` | `listdonogp`, `listadonos` | Lista os donos registrados no grupo |
| `src/commands/owner/listperm.js` | `listperm` | `listperm` | Lista as permissões manuais do grupo |
| `src/commands/owner/modoaluguel.js` | `modoaluguel` | `modoaluguel` | Alterna o modo global de aluguel |
| `src/commands/owner/nick-dono.js` | `nick-dono` | `nick-dono`, `nickdono` | Atualiza o apelido do dono no config.js |
| `src/commands/owner/noprefix.js` | `noprefix` | `noprefix`, `noprefixo` | Autoriza um comando a rodar sem prefixo neste grupo |
| `src/commands/owner/nuke.js` | `kickall` | `kickall`, `nuke`, `ez` | Remove todos os membros do grupo na velocidade máxima segura |
| `src/commands/owner/numero-dono.js` | `numero-dono` | `numero-dono`, `numerodono` | Atualiza o número principal do dono |
| `src/commands/owner/persoemoji.js` | `persoemoji` | `persoemoji`, `setemoji`, `personalizaremoji` | Altera o emoji visual global do bot |
| `src/commands/owner/prefixo.js` | `prefixo` | `prefixo`, `prefixglobal` | Altera o prefixo globalmente e em todos os grupos |
| `src/commands/owner/puxarcase.js` | `puxarcase` | `puxarcase`, `puxarjid` | Converte LID em JID ou resolve o número de um usuário |
| `src/commands/owner/reiniciar.js` | `reiniciar` | `reiniciar`, `restart`, `r` | Reinicia o bot |
| `src/commands/owner/reload.js` | `reload` | `reload`, `recarregar` | Recarrega os comandos sem reiniciar o bot |
| `src/commands/owner/resetanimacao.js` | `resetanimacao` | `resetanimacao` | Remove a animação personalizada de um menu |
| `src/commands/owner/rgfig.js` | `rgfig` | `rgfig` | Salva uma figurinha no catálogo local |
| `src/commands/owner/rm_aluguel.js` | `rm_aluguel` | `rm_aluguel`, `removealuguel`, `removeraluguel` | Remove o registro de aluguel do grupo atual |
| `src/commands/owner/rmblacklist.js` | `rmblacklist` | `rmblacklist`, `delblacklist`, `unblacklist` | Remove número da lista negra do grupo |
| `src/commands/owner/rmdonogp.js` | `rmdonogp` | `rmdonogp` | Remove o dono responsável deste grupo |
| `src/commands/owner/rmperm.js` | `rmperm` | `rmperm` | Remove a permissão de um usuário para um comando |
| `src/commands/owner/rmsubdono.js` | `rmsubdono` | `rmsubdono` | Remove a proteção de subdono do usuário no grupo |
| `src/commands/owner/sair_all.js` | `sair_all` | `sair_all`, `sair-all` | Faz o bot sair de todos os grupos |
| `src/commands/owner/sair.js` | `sair` | `sair`, `sair_chat` | Faz o bot sair do grupo atual |
| `src/commands/owner/seradm.js` | `seradm` | `seradm` | Define o cargo do próprio dono do bot no grupo |
| `src/commands/owner/sermembro.js` | `sermembro` | `sermembro` | Define o cargo do próprio dono do bot no grupo |
| `src/commands/owner/setanimacao.js` | `setanimacao` | `setanimacao` | Guarda um vídeo citado como candidato temporário de animação |
| `src/commands/owner/setbotname.js` | `setbotname` | `setbotname`, `setnomebot`, `nome-bot` | Altera o nome personalizado do bot |
| `src/commands/owner/setmenuimage.js` | `setmenuimage` | `setmenuimage` | Altera a imagem do menu principal |
| `src/commands/owner/setpayment.js` | `setpayment` | `setpayment`, `pagamento`, `valorpagamento`, `valor-pagamento` | Configura o valor global exibido no cartão Anti-Arqv |
| `src/commands/owner/setprefix.js` | `setprefix` | `setprefix` | Altera o prefixo do grupo |
| `src/commands/owner/so_dono.js` | `so_dono` | `so_dono`, `sodono`, `so-dono` | Ativa/desativa o modo restrito (apenas dono pode usar comandos) |
| `src/commands/owner/sorteio.js` | `sortear` | `sortear` | Sorteia um membro do grupo |
| `src/commands/owner/statusgp.js` | `statusgp` | `statusgp`, `statusgrupo` | Posta um texto ou mídia no status do grupo |
| `src/commands/owner/subdonogp.js` | `subdonogp` | `subdonogp` | Adiciona subdono protegido do grupo |
| `src/commands/owner/testedd.js` | `testedd` | `testedd` | Simula a proteção Anti-DDD para testes |
| `src/commands/owner/testepay.js` | `testepay` | `testepay`, `tp` | Envia o painel de pagamento falso visual |
| `src/commands/owner/testepaymentnative.js` | `testepaymentnative` | `testepaymentnative`, `testepayment`, `testepaynative` | Testa o cartão nativo de pagamento do WhatsApp com valor zero |
| `src/commands/owner/unbangp.js` | `unbangp` | `unbangp` | Ativa o bot neste grupo |
| `src/commands/owner/unblockcmd.js` | `unblockcmd` | `unblockcmd` | Desbloqueia um comando no grupo atual |
| `src/commands/owner/unblockcmdg.js` | `unblockcmdg` | `unblockcmdg`, `unblockcmdglobal` | Desbloqueia um comando globalmente |
| `src/commands/owner/unblockgp.js` | `unblockgp` | `unblockgp` | Desbloqueia o bot em um grupo |
| `src/commands/owner/unblockuser.js` | `unblockuser` | `unblockuser` | Desbloqueia usuário |
| `src/commands/owner/ver_aluguel.js` | `ver_aluguel` | `ver_aluguel`, `veraluguel` | Consulta o registro de aluguel do grupo atual |
| `src/commands/owner/verificado-global.js` | `verificado-global` | `verificado-global`, `verificadoglobal` | Marca ou desmarca usuário como verificado globalmente |
| `src/commands/owner/verificado.js` | `verificado` | `verificado` | Marca ou desmarca usuário como verificado neste grupo |
| `src/commands/owner/viplist.js` | `viplist` | `viplist` | Lista os usuários VIP locais |
| `src/commands/owner/visualizarmsg.js` | `visualizarmsg` | `visualizarmsg`, `antidelete`, `antidel` | Ativa (1) ou desativa (0) a visualização de mensagens apagadas |
| `src/commands/owner/x9.js` | `modox9` | `modox9`, `x9` | Ativa ou desativa o monitoramento do grupo |

## Menus

### `src/utils/menus/admin.js`

- `abrir`
- `fechar`
- `descgp`
- `nomegp`
- `mudarftgp`
- `rmphotogp`
- `link`
- `revlinkgp`
- `infogp`
- `infogrupo`
- `limpar`
- `totag`
- `regras`
- `regraspp`
- `ephemeral`
- `msgtemp`
- `status`
- `kick`
- `ban`
- `banfake`
- `banghost`
- `promover`
- `rebaixar`
- `mute`
- `mute2`
- `unmute`
- `mutelist`
- `adv`
- `rmadv`
- `warnings`
- `antiimg`
- `antivideo`
- `antiaudio`
- `antisticker`
- `antitrava`
- `antidoc`
- `antidocumento`
- `anticontato`
- `anticatalogo`
- `antilink`
- `antilinkeasyon`
- `antilinkhard`
- `antibtm`
- `antifake`
- `antipalavra`
- `antidd`
- `antiligacao`
- `antipay`
- `antipagamento`
- `antistatus`
- `antispam`
- `antiflood`
- `antidelete`
- `antiarqv`
- `soadm`
- `subdonogp`
- `bangp`
- `unbangp`
- `infobemvindo`
- `testebv`
- `welcome`
- `legendabv`
- `legendasaiu`
- `legenda_imagem`
- `legenda_video`
- `legenda_documento`
- `legenda_estrangeiro`
- `solicitacao`
- `aceitar`
- `recusar`
- `add_ddd`
- `del_ddd`
- `autorepo`
- `autosticker`
- `autofigu`
- `autototext`
- `addr`
- `delr`
- `listarrespostas`
- `testarresposta`
- `ativarresposta`
- `desativarresposta`
- `editarresposta`
- `configresposta`
- `lembretesgrupo`
- `cancelarlembrete`
- `limparlembretes`
- `odelete`
- `x9`
- `x9visuunica`
- `add_prefixo`
- `tirar_prefixo`
- `prefixos`
- `tempocmd`
- `limite_caracteres`
- `s`
- `x`
- `xp`
- `rank`

### `src/utils/menus/brincadeiras.js`

- `dado`
- `sorte`
- `caraoucoroa`
- `ppt`
- `quiz`
- `adivinha`
- `matematica`
- `forca`
- `casal`
- `ship`
- `namorar`
- `terminar`
- `divorciar`
- `dupla`
- `familia`
- `amigo`
- `amizade`
- `compatibilidade`
- `rank`
- `rankgay`
- `rankgado`
- `rankfofo`
- `rankengracado`
- `ranksortudo`
- `rankinteligente`
- `rankparceiro`
- `lindo`
- `linda`
- `fiel`
- `gostoso`
- `gostosa`
- `sigma`
- `beta`
- `baiano`
- `baiana`
- `carioca`
- `louco`
- `louca`
- `safado`
- `safada`
- `chance`
- `sorteio`
- `meme`
- `piada`
- `cantada`
- `conselho`
- `motivacao`
- `frase`
- `fig`
- `tk`
- `shippar`
- `abraco`
- `carinho`
- `beijo`
- `dado2`
- `verdadeoudesafio`
- `minhadupla`
- `meupar`
- `meumelhoramigo`
- `meumelhorpar`
- `contardias`
- `perfil`
- `meunome`
- `meusigno`

### `src/utils/menus/cons.js`

- `clima`
- `signo`
- `letra`
- `cep`
- `ddd`
- `ip`
- `wikipedia`
- `noticias`

### `src/utils/menus/criador.js`

- Nenhum comando detectado

### `src/utils/menus/dono.js`

- `s`
- `persoemoji`
- `antipv2`
- `antipv3`

### `src/utils/menus/downloads.js`

- `ytmp4`
- `tiktok`
- `instagram`
- `facebook`
- `twitter`
- `play`
- `pinterest`

### `src/utils/menus/efeitos.js`

- `attp`
- `brat1`
- `brat2`
- `brat3`
- `brat4`
- `bratvideo`

### `src/utils/menus/ia.js`

- `gpt`
- `gemini`
- `claude`
- `modoia`
- `statusia`
- `limparia`
- `flux`
- `imagine`
- `ia`

### `src/utils/menus/principal.js`

- `menuadm`
- `menustaff`
- `menubn`
- `menurank`
- `menucons`
- `efeitosimg`
- `noprefix`
- `status`
- `donos`
- `menudono`
- `ping`
- `maisusados`
- `atividade`
- `rankativo`
- `rankativos`
- `checkativo`
- `infodono`
- `infobot`
- `criador`
- `avaliar`
- `alugar`
- `ver_aluguel`
- `statusapi`
- `play`
- `playvid`
- `playdoc`
- `playaudio`
- `playvideo`
- `playmp4`
- `ytmp3`
- `ytmp4`
- `ytsearch`
- `tiktok`
- `tiktok_video`
- `tiktok_audio`
- `tiktok2`
- `tiktok_video2`
- `tiktok_audio2`
- `instagram`
- `insta_audio`
- `instagram2`
- `insta_video2`
- `insta_audio2`
- `facebook`
- `face_video`
- `face_audio`
- `twitter_video`
- `twitter_audio`
- `kwai`
- `soundcloud`
- `mediafire`
- `gerarlink`
- `clima`
- `book`
- `movie`
- `imdb`
- `imdbinfo`
- `playstore`
- `serie`
- `series`
- `aptoide`
- `signo`
- `amazon`
- `amazonsearch`
- `wikipedia`
- `wiki`
- `pinterest`
- `getnoticias`
- `noticias`
- `googlenews`
- `gnews`
- `gruposwhatsapp`
- `letra`
- `letramusic`
- `cep`
- `ddd`
- `ip`
- `fig`
- `fsticker`
- `sticker`
- `st`
- `stk`
- `circulo`
- `redonda`
- `saudio`
- `somfig`
- `figvideo`
- `figfundo`
- `figusemfundo`
- `figperfil`
- `figuweb`
- `toimg`
- `togif`
- `stickerinfo`
- `idfig`
- `rgfig`
- `listafig`
- `delfig`
- `stmetadata`
- `attp`
- `brat1`
- `brat2`
- `brat3`
- `brat4`
- `bratteste`
- `bratvteste`
- `bratvideo`
- `roubar`
- `take`
- `qc`
- `ttps`
- `s`
- `sc`
- `forca`
- `jogodavelha`
- `resetvelha`
- `resetarvelha`
- `cassino`
- `slot`
- `dadoapostado`
- `roletarussa`
- `gartic`
- `enigma`
- `revelarenigma`
- `quizanimais`
- `quizfutebol`
- `anagrama`
- `enquete`
- `eununca`
- `vcprefere`
- `chance`
- `casal`
- `shipo`
- `totext`
- `audiodoc`
- `responda`
- `gtts`
- `simi`
- `tagme`
- `emoji`
- `tabela`
- `mytag`
- `conselhosbilbicos`
- `cantadas`
- `conselhos`
- `perfil`
- `perfil2`
- `calcular`
- `calc`
- `obesidade`
- `contardias`
- `fazernick`
- `traduzir`
- `contato`
- `gerarcpf`
- `qrcode`
- `encurtalink`
- `getperfil`
- `getbio`
- `lembrete`
- `lermais`
- `spoiler`
- `idade`
- `wame`

### `src/utils/menus/rank.js`

- `rank`
- `rankgay`
- `rankgado`
- `rankfofo`
- `rankengracado`
- `ranksortudo`
- `rankinteligente`
- `rankparceiro`

### `src/utils/menus/staff.js`

- `addvip`
- `delvip`
- `viplist`
- `setprefix`
- `setnomebot`
- `soadm`
- `modox9`
- `setpayment`
- `salvarconfig`

## Aliases carregados que não aparecem nos menus

- `a`
- `abracar`
- `abraçar`
- `abrirgp`
- `addall`
- `addcmdvip`
- `addperm`
- `addprefixo`
- `addrc`
- `adivinhar`
- `admin`
- `admins`
- `adms`
- `adotar`
- `adotarfilho`
- `advertencias`
- `advertir`
- `advlist`
- `afago`
- `afk`
- `agp`
- `allgp`
- `allgroups`
- `aluguel`
- `animacoes`
- `aniversario-global`
- `aniversarioglobal`
- `anti-arqv`
- `anti-call`
- `anti-status`
- `antibtn`
- `anticall`
- `antidd-list`
- `antidel`
- `antilinkeary`
- `antilinkgp`
- `antinota`
- `antinotas`
- `antipalavrao`
- `antipalavrão`
- `antipv`
- `antitravas`
- `apis`
- `apostar`
- `app`
- `ativadms`
- `ativarrespostas`
- `audio-menu`
- `audio2doc`
- `audio_documento`
- `audioefeito`
- `audiomenu`
- `backup`
- `baixar_audio_interno`
- `baixarvideo`
- `batalha`
- `beijar`
- `bemvindo`
- `bemvindo2`
- `bff`
- `blacklist`
- `blockcmd`
- `blockcmdg`
- `blockcmdglobal`
- `blockgp`
- `blocklist`
- `blockuser`
- `botinfo`
- `brat`
- `bratv`
- `broadcast`
- `buscar`
- `cafune`
- `casar`
- `charada`
- `clearperm`
- `cloude`
- `cmdviplist`
- `compativel`
- `configurarresposta`
- `consmenu`
- `consultar_vip`
- `conta`
- `criargp`
- `criargrupo`
- `deepseek`
- `delblacklist`
- `delcmdvip`
- `delrc`
- `delreacao`
- `delreacoes`
- `demote`
- `desativarrespostas`
- `desenhar`
- `desligarresposta`
- `desmute`
- `dev`
- `dias`
- `divid`
- `divmsg`
- `divulgacao`
- `divulgar`
- `donogp`
- `donoinfo`
- `duelo`
- `editarrespostas`
- `editresposta`
- `efeitos`
- `entrargp`
- `entrargrupo`
- `ez`
- `f`
- `face`
- `fancy`
- `fb`
- `fechargp`
- `feedback`
- `fgp`
- `figia`
- `figinfo`
- `filme`
- `filtro`
- `fluximg`
- `font`
- `fotomenu`
- `fundomenu`
- `gerarimg`
- `gestao`
- `getcanal`
- `getchannel`
- `getgroupid`
- `gethtml`
- `grupo`
- `grupoinfo`
- `grupos`
- `help`
- `hidetag`
- `hierarquia`
- `hirarquia`
- `ia-sticker`
- `iafig`
- `iasticker`
- `idgrupo`
- `ig`
- `imgfiltro`
- `infiel`
- `infobv`
- `insta`
- `ipinfo`
- `kickall`
- `legendabv2`
- `legendadoc`
- `legendaestrangeiro`
- `legendaimg`
- `legendasaida`
- `legendasaiu2`
- `legendavid`
- `lembrar`
- `ligarresposta`
- `limite_letras`
- `limitecaracteres`
- `limparembretes`
- `linkgp`
- `linkgroup`
- `linkgrupo`
- `lista_aluguel`
- `listaadmins`
- `listadonos`
- `listanegra`
- `listanegrag`
- `listarc`
- `listarespostas`
- `listarlembretes`
- `listarlembretesgrupo`
- `listarreacao`
- `listarreacoes`
- `listbcmdglobal`
- `listblacklist`
- `listblockcmd`
- `listblockcmdglobal`
- `listblockgp`
- `listblockgroups`
- `listdonogp`
- `listperm`
- `livro`
- `melhoresamigos`
- `memes`
- `menu`
- `menubrincadeiras`
- `menudownload`
- `menuia`
- `menuprincipal`
- `menuref`
- `menuteste`
- `meucasal`
- `meuid`
- `meunumero`
- `meusprefixos`
- `mineiro`
- `minhafamilia`
- `modoaluguel`
- `nexraybrat`
- `nick-dono`
- `nickdono`
- `nome`
- `nome-bot`
- `noprefixo`
- `nuke`
- `numero-dono`
- `numerodono`
- `numeroid`
- `off`
- `on`
- `owners`
- `pagamento`
- `paulista`
- `personalizaremoji`
- `pin`
- `play_opcao_interno`
- `playmusic`
- `poll`
- `prefixglobal`
- `prefixo`
- `profile`
- `promote`
- `puxarcase`
- `puxarjid`
- `qr`
- `qualemusica`
- `r`
- `ranking`
- `rankmenu`
- `recarregar`
- `reels`
- `regraspv`
- `reiniciar`
- `reload`
- `removealuguel`
- `removebg`
- `removeradv`
- `removeraluguel`
- `removerfotogp`
- `removerlembrete`
- `resetanimacao`
- `resetxp`
- `restart`
- `revlinkgroup`
- `rm_aluguel`
- `rm_prefixo`
- `rmblacklist`
- `rmdonogp`
- `rmperm`
- `rmsubdono`
- `sair`
- `sair-all`
- `sair_all`
- `sair_chat`
- `salvarlink`
- `salvarlinkgp`
- `savegp`
- `separar`
- `seradm`
- `sermembro`
- `setanimacao`
- `setbotname`
- `setemoji`
- `setmenuimage`
- `shazam`
- `shipar`
- `signoregistro`
- `simisimi`
- `so-dono`
- `so_adm`
- `so_dono`
- `sodono`
- `sortear`
- `spotify`
- `spotifyplay`
- `staffmenu`
- `statusgp`
- `statusgrupo`
- `suporte`
- `t`
- `tempo`
- `tempo_comando`
- `testarrespostas`
- `testedd`
- `testeload`
- `testepay`
- `testepayment`
- `testepaymentnative`
- `testepaynative`
- `tik`
- `timer`
- `tiraradv`
- `tirarprefixo`
- `tk-video`
- `toimage`
- `topcomandos`
- `tp`
- `tt`
- `unblacklist`
- `unblockcmd`
- `unblockcmdg`
- `unblockcmdglobal`
- `unblockgp`
- `unblockuser`
- `valor-pagamento`
- `valorpagamento`
- `vcard`
- `vcf`
- `velha`
- `veraluguel`
- `verblacklist`
- `verblacklistgp`
- `verificado`
- `verificado-global`
- `verificadoglobal`
- `video`
- `visualizarmsg`
- `xvideo`
- `ytplay`
- `ytvideo`
- `zerarativos`
- `zerarxp`

## Conflitos e erros

- Nenhum conflito encontrado.

## Observações

- Aliases são normalizados para minúsculas pelo loader.
- Arquivos de aliases compatíveis continuam listados individualmente para preservar comandos históricos.
- Aliases fora dos menus não são necessariamente um problema: podem ser aliases alternativos, administrativos ou comandos acessíveis diretamente.
