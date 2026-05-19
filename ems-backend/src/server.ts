import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

AppDataSource.initialize().then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"));
});