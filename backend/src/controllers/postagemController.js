import Postagem from "../models/postagemModel.js";
import { z } from "zod";
import formatZodError from "../helpers/formatZodError.js";
//*validações com ZOD
const createSchema = z.object({
  titulo: z
    .string()
    .min(3, { message: "a titulo deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  conteudo: z
    .string()
    .min(3, { message: "a conteudo deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  autor: z
    .string()
    .min(3, { message: "a autor deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
});

const getSchema = z.object({
  id: z.string().uuid({ message: "o id da postagem está inválido" }),
});
const getTarefaPorSituacaoSchema = z.object({
  situacao: z.enum(["pendente", "concluida"]),
});

const updateTarefaSchema = z.object({
  tarefa: z
    .string()
    .min(3, { message: "a postagem deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  descricao: z
    .string()
    .min(5, { message: "descricao deve ter pelo menos 5 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  situacao: z.enum(["pendente", "concluida"]),
});

//*blog?page=1&limit=10
export const getAll = async (request, response) => {
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const postagens = await Postagem.findAndCountAll({
      limit,
      offset,
    });

    const totalPaginas = Math.ceil(postagens.count / limit);
    response.status(200).json({
      totalPostagens: postagens.count,
      totalPaginas,
      paginaAtual: page,
      itemsPorPagina: limit,
      proximaPagina:
        totalPaginas === 0
          ? null
          : `http://localhost:3333/postagens?page=${page + 1}`,
      postagens: postagens.rows,
    });
  } catch (error) {
    response.status(500).json({ message: "erro ao buscar postagens" });
  }
};

//*feita
export const create = async (request, response) => {
  //*IMPLEMENTAR A VALIDAÇÃO
  const bodyValidation = createSchema.safeParse(request.body);
  // console.log(bodyValidation);
  if (!bodyValidation.success) {
    response.status(400).json({
      message: "Os dados recebidos do corpo da aplicação são inválidos",
      detalhes: bodyValidation.error,
    });
    return;
  }

  const { titulo, conteudo, autor } = request.body;

  if (!titulo) {
    response.status(400).json({ err: "a titulo é obrigatória" });
    return;
  }
  if (!conteudo) {
    response.status(400).json({ err: "a conteudo é obrigatória" });
    return;
  }
  if (!autor) {
    response.status(400).json({ err: "a autor é obrigatória" });
    return;
  }

  const novaTarefa = {
    titulo,
    conteudo,
    autor,
  };
  try {
    await Postagem.create(novaTarefa);
    response.status(201).json({ message: "Postagem cadastrada" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "erro ao cadastrar Postagem" });
  }
};
//*precisa de validação
export const getTarefa = async (request, response) => {
  const paramValidator = getSchema.safeParse(request.params);
  if (!paramValidator.success) {
    response.status(400).json({
      message: "número de identifcação está inválido",
      detalhes: formatZodError(paramValidator.error),
    });
    return;
  }
  const { id } = request.params;
  try {
    // const tarefa = await Tarefa.findByPk(id);
    // OBJETO;
    const tarefa = await Tarefa.findOne({ where: { id } });
    if (tarefa === null) {
      response.status(404).json({ message: "tarefa não encontrada" });
      return;
    }
    response.status(200).json(tarefa);
  } catch (error) {
    response.status(500).json({ message: "erro ao buscar tarefa" });
  }
};
//*precisa de validação
export const updateTarefa = async (request, response) => {
  const paramValidator = getSchema.safeParse(request.params);
  if (!paramValidator.success) {
    response.status(400).json({
      message: "número de identifcação está inválido",
      detalhes: formatZodError(paramValidator.error),
    });
    return;
  }
  const updateValidator = updateTarefaSchema.safeParse(request.body);
  if (!updateValidator.success) {
    response.status(400).json({
      message: "dados para atualização estão incorretos",
      details: formatZodError(updateValidator.error),
    });
    return;
  }
  const { id } = request.params;
  const { tarefa, descricao, status } = request.body;

  const tarefaAtualizada = {
    tarefa,
    descricao,
    status,
  };
  try {
    const [linhasAfetadas] = await Tarefa.update(tarefaAtualizada, {
      where: { id },
    });
    if (linhasAfetadas <= 0) {
      response.status(404).json({ message: "tarefa não encontrada" });
      return;
    }

    response.status(200).json({ message: "tarefa atualiza" });
  } catch (error) {
    response.status(200).json({ message: "erro ao atualizar tarefa" });
  }
};
//*precisa de validação
export const updateStatusTarefa = async (request, response) => {
  const paramValidator = getSchema.safeParse(request.params);
  if (!paramValidator.success) {
    response.status(400).json({
      message: "número de identifcação está inválido",
      detalhes: formatZodError(paramValidator.error),
    });
    return;
  }
  const { id } = request.params;
  try {
    const tarefa = await Tarefa.findOne({ raw: true, where: { id } });
    if (tarefa === null) {
      response.status(404).json({ message: "tarefa não encontrada" });
      return;
    }
    if (tarefa.status === "pendente") {
      await Tarefa.update({ status: "concluida" }, { where: { id: id } });
    } else if (tarefa.status === "concluida") {
      await Tarefa.update({ status: "pendente" }, { where: { id: id } });
      //*
    }
    const tarefaAtualizada = await Tarefa.findOne({ raw: true, where: { id } });
    response.status(200).json(tarefaAtualizada);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "erro ao atualizar tarefa" });
  }
};
//*precisa de validação
export const getTarefaPorSituacao = async (request, response) => {
  const situacaoValidation = getTarefaPorSituacaoSchema.safeParse(
    request.params
  );
  if (!situacaoValidation.success) {
    response.status(400).json({
      message: "Situação inválida",
      details: formatZodError(situacaoValidation.error),
    });
    return;
  }
  const { situacao } = request.params;
  if (situacao !== "pendente" && situacao !== "concluida") {
    response
      .status(400)
      .json({ message: "Situação inválida. Use 'pendente' ou 'concluida'" });
    return;
  }
  try {
    const tarefas = await Tarefa.findAll({
      where: { status: situacao },
      raw: true,
    });
    response.status(200).json(tarefas);
  } catch (error) {
    response.status(500).json({ err: "erro ao buscar tarefas" });
  }
};
