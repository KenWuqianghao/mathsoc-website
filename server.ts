import { Request, Response } from "express";

import dotenv from "dotenv";
import express from "express";
import path from "path";
import fileUpload from "express-fileupload";

import publicRoutes from "./server/routes/public-routes";
import authenticatedRoutes from "./server/routes/authenticated-routes";
import adminRoutes from "./server/routes/admin-routes";
import api from "./server/api";
import { Logger, loggerMiddleware } from "./server/util/logger";
import fs from "fs";
import { DirectoryPrebuilder } from "./server/routes/controllers/directory-prebuilder";
const logger = new Logger();

dotenv.config(); // load .env variables

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");

app.locals.basedir = path.join(__dirname, "");

// @todo: remove this code when autogenerating all required folders
const isUploadDirectory = fs.existsSync("public/assets/img/uploads");
if (!isUploadDirectory) {
  fs.mkdirSync("public/assets/img/uploads");
}

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(
    fileUpload({
      safeFileNames: true,
      preserveExtension: 4, // jpeg is longest we can use
    })
  )
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .use(loggerMiddleware(logger))
  .use(publicRoutes)
  .use("/api", api)
  // @todo General student authentication
  .use(authenticatedRoutes)
  // @todo Admin authentication
  .use(adminRoutes)
  .use((req: Request, res: Response) => {
    res.status(404).render("pages/error");
  });

DirectoryPrebuilder.prebuild();

app.listen(port, () => {
  console.info(
    "\n=========================\nlive on localhost:3000 🚀\n=========================\n" +
      fs.readFileSync("logo.txt", "utf-8")
  );
});
