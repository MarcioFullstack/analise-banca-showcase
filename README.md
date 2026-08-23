# 📊 Sistema de Análise de Editais e Geração de Simulados (Showcase)

> **Nota de Privacidade:** Este é um repositório de demonstração. O código-fonte completo é privado — propriedade intelectual de um produto em desenvolvimento ativo. Este showcase mostra arquitetura, decisões técnicas e resultados reais, sem expor a lógica proprietária de geração e auditoria de conteúdo.

## 🎯 O problema que o sistema resolve

Analisa editais reais de concursos públicos (PDFs de 30-80+ páginas, múltiplos cargos), extrai o conteúdo programático de cada cargo, e gera simulados de questões auditadas — fiéis ao formato real de cada banca examinadora (número de alternativas, estilo de enunciado, nível de armadilha).

**Validação real:** o sistema já foi usado para gerar material de estudo para provas efetivamente aplicadas (concursos estaduais no Ceará), com questões geradas cobrindo os mesmos tópicos técnicos cobrados nas provas reais.

## 🧠 Arquitetura de confiança (o diferencial técnico)

A maior parte de sistemas de "IA gerando questão" simplesmente confia no modelo. Este sistema não:

- **Grounding obrigatório:** toda questão é gerada a partir do conteúdo programático real extraído do edital — nunca de conhecimento genérico do modelo sobre o cargo.
- **Auditoria em duas passadas, com provedores de IA independentes:** um modelo gera a questão, um segundo modelo (provedor diferente) audita — cobertura do tópico correto e exatidão do gabarito — antes de aprovar. Reduz erro correlacionado entre geração e verificação.
- **Confiança estatística explícita:** o sistema nunca afirma "padrão da banca X" sem amostra suficiente de provas reais processadas — abaixo do limiar, mostra "dado insuficiente" em vez de fingir certeza.
- **Fail-fast em regras de formato:** checagens determinísticas (número de alternativas, presença de explicação pedagógica) reprovam automaticamente antes mesmo de gastar uma chamada de auditoria semântica cara.

## 🚀 Funcionalidades

- **Parser de edital multi-banca:** extrai cargos, conteúdo programático e estrutura de prova de editais com formatos bem diferentes entre bancas (testado com duas bancas reais, formatos de cabeçalho de seção totalmente distintos).
- **Geração + auditoria de questões:** pipeline com dois provedores de IA (intercambiáveis), grounding no edital real, explicação pedagógica gerada para cada questão.
- **Exportação em PDF:** simulado pronto pra impressão/estudo offline, com gabarito separado.
- **Quiz interativo:** feedback visual imediato (certo/errado), explicação de reforço pedagógico.
- **Dashboard de desempenho:** acompanhamento real de acertos por tópico, fila de revisão de questões erradas, recomendação de foco de estudo derivada de dado real (não estimativa).

## 🛠️ Stack técnica

- **Backend:** Node.js, TypeScript, Fastify, SQLite
- **Frontend:** React, TypeScript, Vite, Tailwind
- **Geração de PDF:** Puppeteer
- **IA:** integração com múltiplos provedores de LLM via API, com camada de abstração para troca sem reescrita
- **Testes:** suíte automatizada (150+ testes) cobrindo parser, pipeline de geração/auditoria, API e frontend

## 📸 Capturas de tela

*(adicionar aqui — screenshots das telas de quiz e dashboard)*

## 🔗 Demonstração

*(link de deploy, se/quando disponível)*
