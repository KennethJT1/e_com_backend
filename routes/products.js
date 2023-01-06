import express from "express";
import formidable from "express-formidable";
import {
  create,
  list,
  read,
  photo,
  remove,
  update,
  filteredProducts,
  productsCount,
  listProducts,
  productsSearch,
  relatedProducts,
  getToken,
  procesPayment,
  orderStatus
} from "../controller/product.js";

const router = express.Router();

//middleware
import { auth, adminAuth } from "../middlewares/auth.js";

router.post("/product", auth, adminAuth, formidable(), create);
router.get("/products", list);
router.get("/product/:slug", read);
// to get product with photo
router.get("/product/photo/:productId", photo);
router.delete("/product/:productId", auth, adminAuth, remove);
router.put("/product/:productId", auth, adminAuth, formidable(), update);

//use frontend to create these
router.post("/filtered-products", filteredProducts);
router.get("/products-count", productsCount);
router.get("/list-products/:page", listProducts);
router.get("/products/search/:keyword", productsSearch);

//the product id is needed so that it won't be shown on related product
router.get("/related-products/:productId/:categoryId", relatedProducts);

router.get("/braintree/token", getToken);
router.post("/braintree/payment",auth, procesPayment);
router.put("/order-status/:orderId", auth, adminAuth, orderStatus);

export default router;
