import { Router } from "express";

import {
  create, getAll, getPostagem, updatePostagem,
} from "../controllers/postagemController.js";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getPostagem);
router.put("/:id", updatePostagem);
export default router;
