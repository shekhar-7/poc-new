// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Project } from "../entities/Project";
import { Agency } from "../entities/Agency";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "aveosoft",
    password: process.env.DB_PASSWORD || "aveo@@123",
    database: process.env.DB_NAME || "new_test_db",
    synchronize: true, // Use only for development. In production, use migrations instead.
    logging: false,
    entities: [User, Project, Agency],
});
