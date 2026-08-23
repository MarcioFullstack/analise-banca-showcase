import type { PerfilBanca } from "../banca-profile/types.js";
import type { MateriaProgramatica } from "../parser/types.js";

/**
 * Fallback quando o edital não declara `numeroAlternativasPorQuestao`
 * explicitamente — padrão mais comum em concursos brasileiros de múltipla
 * escolha (A a D).
 */
export const NUMERO_ALTERNATIVAS_PADRAO = 4;

/**
 * Quantos tópicos `gerarQuestoesParaCargo` processa em paralelo por padrão
 * nos chamadores reais (CLI, API) — cada tópico já é gerado+auditado de
 * forma independente, então rodar vários ao mesmo tempo corta o tempo de
 * espera do usuário sem mudar nenhum resultado. Valor conservador (não o
 * máximo que os provedores aguentariam) pra não arriscar rate limit num
 * lote grande — ver comentário de `gerarQuestoesParaCargo`.
 */
export const CONCORRENCIA_GERACAO_PADRAO = 3;

export interface TopicoAlvo {
  materia: string;
  numero?: string;
  texto: string;
}

/** Pedido de geração para UM tópico específico — não "gera algo de Direito Administrativo". */
export interface SolicitacaoGeracao {
  topico: TopicoAlvo;
  banca: string;
  cargo: string;
  /** Quantas questões gerar para ESTE tópico (normalmente 1 quando vem de uma distribuição por cargo). */
  quantidadeDesejada: number;
  /**
   * Número de alternativas exigido pela banca (`EstruturaProvaObjetiva.numeroAlternativasPorQuestao`
   * do edital, com fallback pra `NUMERO_ALTERNATIVAS_PADRAO` quando o edital
   * não declara). Obrigatório — não é mais deixado a critério do modelo, ver
   * CLAUDE.md (bug real encontrado na validação: questão saiu com 4
   * alternativas quando o edital pedia 5).
   */
  numeroDeAlternativas: number;
  /** Só passado quando já existe PerfilBanca consolidado (algum item com amostraSuficiente=true). */
  perfilBanca?: PerfilBanca;
  /** Texto livre com o estilo já documentado da banca — usado quando não há perfilBanca ainda (ex: IDECAN hoje). */
  estiloConhecidoDaBanca?: string;
}

/** Pedido de geração para um CARGO inteiro — distribui quantidadeDesejada entre os tópicos do conteúdo programático. */
export interface SolicitacaoGeracaoCargo {
  banca: string;
  cargo: string;
  materias: MateriaProgramatica[];
  quantidadeDesejada: number;
  /** Ver `SolicitacaoGeracao.numeroDeAlternativas`. */
  numeroDeAlternativas: number;
  perfilBanca?: PerfilBanca;
  estiloConhecidoDaBanca?: string;
}

export interface AlternativaGerada {
  letra: string;
  texto: string;
}

export type StatusQuestaoGerada = "aprovada" | "reprovada";

export interface QuestaoGerada {
  enunciado: string;
  alternativas: AlternativaGerada[];
  respostaCorreta: string;
  /** Tópico que o GERADOR afirma ter coberto — a auditoria confere se bate com o pedido. */
  topicoCoberto: TopicoAlvo;
  /**
   * Justificativa pedagógica curta, exibida ao usuário depois que ele
   * responde a questão (reforço de memorização, não só feedback certo/errado).
   * Campo obrigatório em toda questão gerada a partir de agora — mas
   * `resultado_json` de gerações antigas (persistido antes desse campo
   * existir, ex: `geracoes.id=1`) não vai ter essa chave no JSON salvo, e o
   * `JSON.parse` não faz essa ausência virar erro em runtime. Quem consome
   * (`src/web`) trata a ausência de forma defensiva — ver CLAUDE.md.
   */
  explicacao: string;
  banca: string;
  cargo: string;
  status: StatusQuestaoGerada;
  motivoReprovacao?: string;
  geradoEm: string;
}

/**
 * Saída da passada de auditoria. `motivo` deve vir preenchido sempre que
 * `cobreTopico` OU `gabaritoCorreto` for false (não só quando cobreTopico for
 * false) — todo descarte precisa ter explicação registrada. Só fica vazio
 * quando ambos forem true.
 */
export interface ResultadoAuditoria {
  cobreTopico: boolean;
  gabaritoCorreto: boolean;
  motivo?: string;
}

export type MotivoDescarte = "topico-incorreto" | "gabarito-incorreto" | "ambos";

export interface EntradaLogDescarte {
  topico: TopicoAlvo;
  banca: string;
  cargo: string;
  motivoDescarte: MotivoDescarte;
  motivo: string;
  registradoEm: string;
}

export interface ResultadoPipeline {
  questoesAprovadas: QuestaoGerada[];
  log: EntradaLogDescarte[];
  /**
   * `true` quando a execução foi interrompida por limite de cota do
   * provedor de IA (`LimiteCotaExcedidaError`) antes de processar todos os
   * tópicos pedidos — `questoesAprovadas`/`log` contêm só o progresso feito
   * até ali, não o lote completo.
   */
  interrompidoPorLimiteCota?: boolean;
}
