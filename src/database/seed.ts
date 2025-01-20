// src/database/seed.ts

import { DataSource } from "typeorm";
import { seedDatabase } from "./seeder/seeder01";
import { Project } from "../entities/Project";
import { Agency } from "../entities/Agency";
import { User } from "../entities/User";
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const dataSource = new DataSource({
    // Your database configuration here
    type: "postgres", // or your database type
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "aveosoft",
    password: process.env.DB_PASSWORD || "aveo@@123",
    database: process.env.DB_NAME || "new_test_db",
    entities: [User, Project, Agency],
    synchronize: true,
});

async function main() {
    try {
        const connection = await dataSource.initialize();
        const queryRunner = connection.createQueryRunner();
        await seedDatabase(queryRunner, dataSource);
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

main();