// server.js

import { Client } from "@elastic/elasticsearch";
import { User } from "./entities/User";
import {
  startConsumers,
  startKafkaConsumers,
} from "./modules/user/user.consumer";
import { config } from "./config";

const express = require("express");
const dotenv = require("dotenv");
const { AppDataSource } = require("./database/data-source");
const userRoutes = require("./modules/user/user.routes");
const projectRoutes = require("./modules/project/project.routes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected successfully");

    // const esClient = new Client({ node: config.elasticsearch.url });
    // // Log client information
    // console.log(
    //   "Elasticsearch Client Config:",
    //   esClient.connectionPool.connections.map((conn) => conn.url.href)
    // );

    app.use(express.json());

    app.get("/", (req: any, res: any) => {
      res.send("Hello, World!");
    });

    app.use("/users", userRoutes);
    app.use("/projects", projectRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Start the JMS consumer
    startConsumers().catch((err: any) => {
      console.error("Error starting user consumer:", err);
    });

    // Start the Kafka consumer
    startKafkaConsumers().catch((err: any) => {
      console.error("Error starting Kafka consumer:", err);
    });
  })
  .catch((err: any) => {
    console.error("Database connection failed:", err);
  });
