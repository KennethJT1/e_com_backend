import express from "express";
import {
  create,
  update,
  remove,
  list,
  read,
  productByCategory,
} from "../controller/category.js";

const router = express.Router();

//middleware
import { auth, adminAuth } from "../middlewares/auth.js";

router.post("/category", auth, adminAuth, create);
router.put("/category/:categoryId", auth, adminAuth, update);
router.delete("/category/:categoryId", auth, adminAuth, remove);
router.get("/categories", list);
router.get("/category/:slug", read);

//from frontend
router.get("/products-by-category/:slug", productByCategory);

export default router;
