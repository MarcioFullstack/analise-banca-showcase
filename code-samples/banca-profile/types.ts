/** Sinais objetivos extraídos de UMA prova. Nunca é sobrescrito — ver src/db/schema.sql (sinais_prova). */
export interface SinaisDaProva {
  arquivoOrigemProva: string;
  totalQuestoes: number;
  frequenciaPorMateria: FrequenciaMateria[];
  padroesDeEnunciado: PadraoEnunciado[];
  termosArmadilha: OcorrenciaTermoArmadilha[];
  comprimentoAlternativas?: EstatisticaComprimentoAlternativas;
  processadoEm: string; // ISO timestamp
}

export interface FrequenciaMateria {
  /** Nome da matéria como aparece na PROVA (Questao.materia) — não casado com o nome do edital aqui. */
  materia: string;
  quantidadeQuestoes: number;
  /**
   * Preenchido só quando um EditalExtraido foi passado a `analisarSinais` E uma
   * matéria correspondente foi encontrada por match aproximado de nome. Quando
   * não há edital linkado, fica undefined — o sinal de frequência por matéria
   * continua válido, só não tem o cruzamento com o conteúdo programático.
   */
  topicosDoEdital?: TopicoRelacionado[];
}

/**
 * Não temos como atribuir uma questão a um tópico específico do conteúdo
 * programático (isso exigiria casar o texto da questão com o tópico, fora do
 * escopo estatístico deste módulo) — por isso só listamos os tópicos da
 * matéria correspondente, sem fingir uma contagem por tópico individual.
 */
export interface TopicoRelacionado {
  numero?: string;
  texto: string;
}

export type CategoriaEnunciado =
  | "assinale-a-correta"
  | "assinale-a-incorreta"
  | "julgue-o-item"
  | "outro";

export interface PadraoEnunciado {
  categoria: CategoriaEnunciado;
  ocorrencias: number;
}

export type TermoArmadilha =
  | "sempre"
  | "nunca"
  | "exclusivamente"
  | "somente"
  | "unicamente"
  | "todo"
  | "nenhum"
  | "apenas";

export interface OcorrenciaTermoArmadilha {
  termo: TermoArmadilha;
  ocorrenciasEmAlternativaCorreta: number;
  ocorrenciasEmAlternativaIncorreta: number;
}

export interface EstatisticaComprimentoAlternativas {
  mediaCaracteresAlternativaCorreta: number;
  mediaCaracteresAlternativaIncorreta: number;
  /** Quantas questões com gabarito conhecido entraram nesse cálculo — sem gabarito não dá pra saber qual é a correta. */
  amostraComGabarito: number;
}

/**
 * Envelope de confiança: todo valor de `PerfilBanca` que descreve uma
 * tendência carrega quanto dado o sustenta. Nunca exponha um "padrão" sem
 * isso junto — ver AMOSTRA_MINIMA em aggregator.ts.
 */
export type ItemConsolidado<T> = T & {
  numeroDeProvas: number;
  amostraSuficiente: boolean;
};

/** Perfil consolidado de uma banca, agregando SinaisDaProva de todas as provas já processadas. */
export interface PerfilBanca {
  bancaId: number;
  bancaNome: string;
  totalProvasAnalisadas: number;
  /** totalProvasAnalisadas >= AMOSTRA_MINIMA (aggregator.ts). */
  amostraSuficiente: boolean;

  distribuicaoPorMateria: ItemConsolidado<{ materia: string; percentualMedioDeQuestoes: number }>[];
  padroesDeEnunciado: ItemConsolidado<{ categoria: CategoriaEnunciado; frequenciaTotal: number }>[];
  termosArmadilha: ItemConsolidado<{ termo: TermoArmadilha; proporcaoEmAlternativaCorreta: number }>[];
  /** undefined se nenhuma prova processada tinha gabarito suficiente para calcular. */
  comprimentoAlternativas?: ItemConsolidado<EstatisticaComprimentoAlternativas>;

  atualizadoEm: string;
}

export interface FontePesquisaExterna {
  titulo: string;
  url: string;
}

/**
 * Síntese de conhecimento PÚBLICO sobre o estilo de uma banca (sites de
 * concurso, análises de terceiros) — via busca na web + LLM. NUNCA deve ser
 * confundida com `PerfilBanca`, que é medição estatística de provas reais já
 * processadas pelo sistema. `fontes` vem dos resultados de busca de fato
 * retornados pela ferramenta (não é autorrelato do modelo) — ver
 * pesquisa-externa.ts.
 */
export interface PesquisaExternaBanca {
  bancaId: number;
  bancaNome: string;
  resumo: string;
  fontes: FontePesquisaExterna[];
  buscadoEm: string; // ISO timestamp
}

/**
 * Resposta combinada das duas fontes de sinal sobre uma banca — mantidas
 * SEMPRE separadas, nunca fundidas num único texto/afirmação (ver
 * pesquisa-externa.ts e CLAUDE.md). `pesquisaExterna` só vem preenchido
 * quando já foi buscado (cache válido); `pesquisaExternaDisponivel` avisa o
 * cliente que pode oferecer a busca sob demanda quando ainda não foi feita.
 */
export interface RespostaPerfilBanca {
  perfilInterno: PerfilBanca;
  pesquisaExterna?: PesquisaExternaBanca;
  pesquisaExternaDisponivel: boolean;
}
