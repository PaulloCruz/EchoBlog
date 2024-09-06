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

//*blog?page=1&limit=10 -OK
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

//*OK
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

  const { titulo, conteudo, autor, imagem } = request.body;

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
    imagem,
  };
  try {
    await Postagem.create(novaTarefa);
    response.status(201).json({ message: "Postagem cadastrada" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "erro ao cadastrar Postagem" });
  }
};
//*OK
export const getPostagem = async (request, response) => {
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
    const postagem = await Postagem.findOne({ where: { id } });
    if (postagem === null) {
      response.status(404).json({ message: "postagem não encontrada" });
      return;
    }
    response.status(200).json(postagem);
  } catch (error) {
    response.status(500).json({ message: "erro ao buscar postagem" });
  }
};
//*Ok
export const updatePostagem = async (request, response) => {
  const paramValidator = getSchema.safeParse(request.params);
  if (!paramValidator.success) {
    response.status(400).json({
      message: "número de identifcação está inválido",
      detalhes: formatZodError(paramValidator.error),
    });
    return;
  }

  const { id } = request.params;
  const { titulo, conteudo, imagem } = request.body;

  const postagemAtualizada = {
    titulo,
    conteudo,
    imagem,
  };
  try {
    const [linhasAfetadas] = await Postagem.update(postagemAtualizada, {
      where: { id },
    });
    if (linhasAfetadas <= 0) {
      response.status(404).json({ message: "postagem não encontrada" });
      return;
    }

    response.status(200).json({ message: "postagem atualizada" });
  } catch (error) {
    response.status(200).json({ message: "erro ao atualizar postagem" });
  }
};
//*precisa de validação
export const DeletePostagem = async (request, response) => {
  const paramValidator = getSchema.safeParse(request.params);
  if (!paramValidator.success) {
    response.status(400).json({
      message: "número de identificação está inválido",
      detalhes: formatZodError(paramValidator.error),
    });
    return;
  }
  const { id } = request.params;
  try {
    const linhasAfetadas = await Postagem.destroy({
      where: { id },
    });
    if (linhasAfetadas === 0) {
      response.status(404).json({ message: "postagem não encontrada" });
      return;
    }
    response.status(200).json({ message: "postagem deletada" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "erro ao deletar postagem" });
  }
};
export const UploadImagemPostagem = async (request, response) => {
  try {
    const { id } = request.params;
    if (!request.file) {
      return response.status(400).json({ error: "imagem não enviada" });
    }
    const post = await Postagem.findByPk(id);
    if (!post) {
      return response.status(404).json({ message: "postagem nao encontrada" });
    }
    post.imagem = `/uploads/images/${request.file.filename}`;
    await post.save();
    response
      .status(200)
      .json({ message: "imagem enviada com sucesso", imagem: post.imagem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        errors: error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }
    console.error(error);
    response.status(500).json({ error: "erro ao enviar a imagem" });
  }
};
