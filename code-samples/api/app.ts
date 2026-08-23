import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import Fastify, { type FastifyInstance } from "fastify";
import { registrarRotasAuth } from "./auth/rotas.js";
import { registrarRotasBancas } from "./rotas/bancas.js";
import { registrarRotasEditais } from "./rotas/editais.js";
import { registrarRotasGeracao } from "./rotas/geracao.js";
import { registrarRotasProvas } from "./rotas/provas.js";
import { registrarRotasRespostas } from "./rotas/respostas.js";

// Default do Fastify é 1 MiB — pequeno demais pra edital/prova real (o PDF
// real da ALECE, por exemplo, tem 78 páginas e ~1,3 MB, batendo 413 com o
// default). 20 MiB cobre PDFs de edital/prova grandes com folga.
const LIMITE_TAMANHO_CORPO_BYTES = 20 * 1024 * 1024;

export function construirApp(): FastifyInstance {
  const app = Fastify({ logger: false, bodyLimit: LIMITE_TAMANHO_CORPO_BYTES });

  app.register(cookie);
  // attachFieldsToBody: as rotas de upload (provas, editais) recebem PDF +
  // campos de texto (ex: banca) no mesmo multipart — assim tudo cai junto
  // em request.body, sem precisar mexer manualmente no stream.
  app.register(multipart, { attachFieldsToBody: true });

  registrarRotasAuth(app);
  registrarRotasProvas(app);
  registrarRotasEditais(app);
  registrarRotasBancas(app);
  registrarRotasGeracao(app);
  registrarRotasRespostas(app);

  return app;
}
