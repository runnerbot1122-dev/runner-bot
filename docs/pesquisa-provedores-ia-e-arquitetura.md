# Pesquisa de provedores de IA e arquitetura proposta

**Data da auditoria:** 28/11/2026

## Conclusão técnica

O Supun API não deve ser adotado como provedor principal nesta etapa. A documentação `/api-doc` redireciona para `/login`, e o bundle público da aplicação marca a página de documentação como `login`. A página pública informa cadastro com 100 coins, chave pessoal por usuário e loja de pacotes, portanto a evidência disponível aponta para cota inicial/créditos, não para uma API ilimitada e permanentemente gratuita. Sem uma conta autorizada e sem um endpoint público documentado, não foi possível validar uma chamada de IA real sem credencial.

Para o bot em Railway, a opção mais segura para começar é usar provedores oficiais com chave própria e adaptadores separados. A primeira combinação recomendada é Gemini oficial para `7gemini`, Groq para `7gpt` como nome de comando compatível com o pedido do usuário — embora o modelo não seja GPT — e um terceiro adaptador configurável para Claude quando houver uma chave oficial. OpenRouter pode funcionar como fallback opcional, mas seus modelos `:free` possuem limite explícito e disponibilidade variável. Hugging Face não é uma boa escolha para o requisito “gratuito” em conta Free, porque a documentação atual informa que usuários Free não recebem créditos mensais.

## Supun API

- `https://supunofc.site/` descreve um hub REST com testes de YouTube, TikTok, IA e anime.
- A mesma página promete 100 coins no cadastro e uma chave pessoal para cada usuário.
- `https://supunofc.site/terms` informa que requisições pagas consomem coins e que endpoints e políticas podem mudar.
- A navegação dinâmica de `https://supunofc.site/api-doc` redirecionou para `https://supunofc.site/login`.
- O bundle público `/assets/index-SKeVyYFb.js` contém a rota `/api/content/page-access` e marca `api-doc` com acesso padrão `login`; não há nomes de modelos Gemini, GPT ou Claude nem rotas públicas de IA literais no bundle analisado.

**Decisão:** não cadastrar, não tentar contornar login e não colocar Supun no código como se fosse gratuito. Se o usuário fornecer uma chave e autorização para teste, validar apenas o endpoint exibido no painel dele, com URL, método, parâmetros e custo registrados.

## Provedores oficiais comparados

### Gemini API / Google AI Studio

A documentação oficial oferece uma camada Free com acesso limitado a certos modelos e tokens de entrada e saída gratuitos. Os limites são medidos por RPM, TPM e RPD, variam por modelo e projeto, e o upgrade para Tier 1 exige vincular faturamento. O conteúdo do Free Tier pode ser usado para melhoria dos produtos do Google conforme os termos.

**Classificação:** gratuito com chave e cota; não ilimitado. É o candidato mais direto para `7gemini`.

Fontes: [1] [2]

### Groq

A documentação oficial informa limites por organização em RPM, RPD, TPM, TPD e, para áudio, ASH e ASD. A página consultada mostra limites-base por modelo e respostas 429 quando uma cota é excedida. A página de spend limits deixa claro que controles de gasto são recurso de conta paga; isso não transforma a camada de acesso em ilimitada.

**Classificação:** chave obrigatória, cota gratuita sujeita à conta/modelo e à política vigente; muito adequado para baixa latência e modelos open-weight. Deve ser tratado no código como `groq`, mesmo que o comando solicitado seja `7gpt`, para não afirmar que é OpenAI GPT.

Fontes: [3] [4]

### OpenRouter

A API usa chave Bearer e oferece variantes com sufixo `:free`. Para contas com menos de 10 créditos comprados, a documentação informa 20 requisições por minuto e 50 por dia; com pelo menos 10 créditos comprados, o limite diário informado é 1000, mantendo 20 por minuto. A própria documentação avisa que modelos gratuitos podem ficar indisponíveis ou sofrer limitação do provedor upstream.

**Classificação:** gratuito limitado com chave; bom fallback opcional, nunca uma garantia de disponibilidade. O uso de `openrouter/free` ou de um modelo `:free` deve ter tratamento claro de 429 e fallback.

Fontes: [5] [6]

### Hugging Face Inference Providers

A tabela oficial informa que usuários Free não recebem créditos mensais. Usuários PRO, Team e Enterprise recebem créditos mensais, e o uso além da cota é pay-as-you-go ou exige compra de créditos.

**Classificação:** não atende ao requisito de gratuito para conta Free; não priorizar.

Fonte: [7]

### NVIDIA NIM

A página oficial exige criar/verificar conta e gerar API key para usar os endpoints de inferência. A página inicial apresenta “Free inference” para modelos destacados, mas isso não é uma promessa de uso ilimitado nem substitui a consulta dos limites específicos da conta.

**Classificação:** chave obrigatória, acesso gratuito condicionado a limites e política da conta. Pode permanecer como fallback existente, com modelo configurável e sem assumir gratuidade permanente.

Fonte: [8]

## Arquitetura proposta para o Runner Bot

Criar `src/utils/aiProviders.js` como camada de adaptadores. Cada adaptador recebe `messages`, timeout e limite de saída e devolve `{ text, provider, model }` ou lança um erro normalizado com `code`, `status` e `retryable`.

A configuração deve usar variáveis separadas:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-5
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
NVIDIA_API_KEY=
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
```

Os nomes de modelo acima são apenas defaults a revisar na implementação. O bot deve permitir sobrescrever todos por ambiente e não deve afirmar que um modelo está disponível sem resposta válida do provedor.

A camada de histórico deve ficar separada do comando e usar chave composta por `chat`, `sender` e `provider`. O histórico deve expirar em 10 minutos, limitar o número de mensagens, remover entradas antigas e nunca incluir tokens ou credenciais em logs. O histórico em memória é suficiente para o primeiro lote; persistência em banco pode ser uma etapa posterior.

O roteamento inicial recomendado é:

- `7gemini`: Gemini oficial.
- `7gpt`: Groq, com texto de ajuda dizendo “modelo rápido” e não “OpenAI GPT”. Se o usuário quiser OpenAI de fato, será necessário uma chave OpenAI separada.
- `7cloude` e `7claude`: adaptador Anthropic oficial, somente quando `ANTHROPIC_API_KEY` estiver configurada. `cloude` é mantido como alias de compatibilidade com o nome pedido.
- `7ia`: alias legado de `7gemini`, preservando o uso atual.
- `7deepseek`: pode apontar para um adaptador explicitamente configurado, mas não deve continuar fingindo que usa um provedor diferente se a implementação for a mesma.
- `7modoia`: ativa o modo contínuo para o chat e remetente.
- `7<nome-do-bot>`: deve ativar o modo contínuo somente quando coincidir exatamente com o nome normalizado retornado por `botNameStore.getBotName()`, sem interceptar mensagens comuns.

O modo contínuo precisa ser implementado depois das proteções e antes do retorno final de mensagem sem prefixo, mas somente para mensagens de texto, chats autorizados e usuários que tenham ativado o modo. Recomenda-se armazenar estado por `chat + sender`, com comandos `7modoia on`, `7modoia off` e `7modoia status`. A mensagem que liga o modo não deve ser enviada à IA. Mensagens normais devem ser encaminhadas apenas quando o estado estiver ativo; mensagens iniciadas com prefixo devem continuar seguindo o dispatcher normal.

Todos os adaptadores devem aplicar timeout, limite de contexto, limite de resposta, cooldown por usuário e mensagens de erro sem expor a resposta bruta do provedor. Em 401/403, informar configuração de chave; em 429, informar limite temporário; em 5xx/timeout, permitir fallback explícito e registrar apenas provedor, modelo e status.

## Próximo lote seguro

1. Implementar os adaptadores Gemini, Groq, Anthropic e fallback opcional OpenRouter sem remover o comando atual.
2. Migrar o histórico atual para um utilitário comum.
3. Criar os comandos separados e manter aliases legados.
4. Adicionar o modo contínuo com ativação explícita.
5. Atualizar o menu de IA e `.env.example`.
6. Criar testes unitários com mocks de HTTP para respostas normais, vazias, 401, 429, timeout e fallback.
7. Só depois fazer testes reais com chaves configuradas no Railway.

## Referências

[1]: https://aistudio.google.com/docs/pricing "Gemini Developer API pricing"
[2]: https://aistudio.google.com/docs/rate-limits "Gemini API rate limits"
[3]: https://console.groq.com/docs/rate-limits "Groq API rate limits"
[4]: https://console.groq.com/docs/spend-limits "Groq spend limits"
[5]: https://openrouter.ai/docs/api_reference/limits "OpenRouter API credit and rate limits"
[6]: https://openrouter.ai/docs/faq "OpenRouter FAQ"
[7]: https://huggingface.co/docs/inference-providers/pricing "Hugging Face Inference Providers pricing"
[8]: https://build.nvidia.com/ "NVIDIA API platform"
[9]: https://supunofc.site/ "Supun Fernando public platform"
[10]: https://supunofc.site/api-doc "Supun API documentation entry point"
[11]: https://supunofc.site/terms "Supun terms and license"
