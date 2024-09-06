import { Router } from "express";

import upload from "../helpers/uploadMiddleware.js";

import {
  create,
  DeletePostagem,
  getAll,
  getPostagem,
  updatePostagem,
  UploadImagemPostagem,
} from "../controllers/postagemController.js";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getPostagem);
router.put("/:id", updatePostagem);
router.delete("/:id", DeletePostagem);
router.post("/:id/imagem", upload.single("imagem"), UploadImagemPostagem);
export default router;
