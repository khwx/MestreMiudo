# TODO - MestreMiúdo Learning Platform

## ✅ Completed
- Fixed production errors (Vercel deployment) - resolved tsconfig encoding issue
- Implemented secure name+code login system for multiple children
- Added Grade 3 curriculum-aligned lessons (7 lessons with challenges)
- Added Grade 4 curriculum-aligned lessons (7 lessons with challenges)
- Implemented lesson progression locking (must complete N before N+1)
- Set up proper Row Level Security (RLS) policies
- Enhanced dashboard to show lesson history, rewards, and progress
- Fixed historical view to show both quizzes and lessons from "Aprender a Brincar"
- Implemented immediate feedback in quizzes (green/red on answer selection)
- Implemented daily challenges and streak system
- Created avatar customization shop using earned coins
- Added mastery tests for level progression
- Improved quiz question validation
- Implemented functional leaderboard with global and grade rankings
- Enhanced rewards integration (coins/stars/badges from student_rewards)
- Added shop system (buy/equip items)
- Fixed leaderboard display bug
- Added Spaced Repetition System (lib + DB tables)
- Added Parent/Teacher Dashboard with progress reports
- Added story characters progression system
- Added sound effects system with Web Audio API
- Added PWA support (manifest.json, service worker, offline page)
- Added accessibility features (keyboard navigation, screen reader, high contrast)
- Implemented story deletion (deleteStory action) wired into the story gallery with a confirmation dialog, optimistic list updates and error handling
- Added a child-friendly "Dica" (hint) button to quiz questions with a derived hint generator and screen-reader announcements
- Added a "Praticar perguntas erradas" mode at the end of the quiz that re-presents only the questions the child got wrong, with unit tests for the selection helper
- Confirmed European Portuguese (pt-PT) voice selection now covers all audio resources (quiz via speechSynthesis voice picker; story workshop TTS uses `pt-PT-RaquelNeural`)
- Confirmed the Estudo do Meio question bank already covers grades 3-4 (topics and questions present in `estudo-do-meio.ts`)

## 📋 Concluídas (histórico de pendências)
- [x] Sincronizar catálogo de conquistas (`lib/achievements.ts`) com `BADGE_DEFINITIONS` para evitar chaves duplicadas
- [x] Adicionar testes unitários para `lib/groq.ts`, `lib/pixabay.ts` e `lib/question-bank.ts`
- [x] Modo "Praticar perguntas erradas" / "Praticar temas fracos" no ecrã de quiz
- [x] Relatório PDF de progresso enviável/partilhável (Web Share API com anexo + fallback mailto) para encarregados de educação
- [x] Suporte offline aprimorado (pré-carregar lições por grade no service worker)
- [x] Acessibilidade: navegação por teclado completa nos jogos (jogo da memória, galo, forca)
- [x] Painel do professor: exportar notas em CSV (`handleExportCsv` no `parent/page.tsx`)
- [x] Sugestões de estudo personalizadas no painel (recomendações por prioridade: revisão, temas fracos, desafio diário, streak)
- [x] Recomendar a próxima lição concreta por completar (usar progresso de lições para obter `nextLessonTitle`)
- [x] Relatório PDF com detalhe por disciplina e evolução semanal (barras de progresso)
- [x] Tradução/adaptação da interface para outros dialetos de português (ex.: pt-BR) — infraestrutura i18n (pt-PT + pt-BR), seletor de idioma e página inicial localizada
- [x] Modo "desafio entre amigos" com partilha de resultado (botão "Desafiar Amigos" nos resultados + ligação de desafio descodificável no quiz)
- [x] Relatório de progresso por disciplina com gráfico de evolução temporal (gráfico de linhas interativo por disciplina nos painéis de encarregado e professor)
- [x] Notificações/push (via service worker) a lembrar a revisão espaçada em falta
- [x] Diploma/certificado de conquista partilhável e imprimível a partir dos resultados do quiz (botão "Ver Diploma" + gerador HTML com escaping anti-XSS)
- [x] Partilha de desafio no WhatsApp a partir dos resultados do quiz (botão "WhatsApp" + `buildWhatsappLink`)
- [x] Partilha de desafio por e-mail (mailto) diretamente a partir dos resultados do quiz (botão "E-mail" + `buildEmailLink`)

## 🚀 Pendentes futuras (candidatas a melhorias)
- [x] Partilha de desafio por e-mail (mailto/SMTP) diretamente a partir dos resultados do quiz
- [ ] Envio de relatório PDF por e-mail via servidor (SMTP/Resend) a partir dos painéis de encarregado/professor
- [x] Novo mini-jogo educativo (ex.: "Caça-Palavras" ou "Sequência Mágica") no Salão de Jogos
- [ ] Expansão do banco de perguntas com mais tópicos curriculum-aligned por disciplina e ano
- [ ] Modo "treino livre" sem guardar pontos, para praticar sem pressão
- [ ] Sincronização de progresso entre dispositivos (conta única do encarregado com várias crianças)
- [x] Acessibilidade: leitor de ecrã a anunciar resultados e conquistas de forma mais rica