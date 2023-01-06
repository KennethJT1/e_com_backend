import express from "express";
import dotenv from "dotenv";
import colours from "colors";
import mongoose from "mongoose";
import logger from "morgan";

import authRoute from "./routes/auth.js";
import categoryRoute from "./routes/category.js";
import productRoute from "./routes/products.js";

//TO CONNECT TO REACT HTTP
import cors from "cors";

const app = express();

//env variable
dotenv.config();

//Connect to mongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database is connected to mongoDB...".blue.bold))
  .catch((err) => console.log("DB ERROR =>".red.bold, err.red.bold));
  mongoose.set('strictQuery', true)

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(cors());

//Routes
app.use("/", authRoute);
app.use("/", categoryRoute);
app.use("/", productRoute);

//port
const port = process.env.PORT || 4900;

app.listen(port, () =>
  console.log(`Server is running on port http://localhost:${port}`.yellow.bold)
); 