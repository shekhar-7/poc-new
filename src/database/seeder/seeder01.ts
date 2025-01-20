// src/database/seeders/seed.ts

import { DataSource, QueryRunner } from "typeorm";
import { faker } from "@faker-js/faker";
import { Agency } from "../../entities/Agency";
import { User } from "../../entities/User";
import { Project, ProjectType } from "../../entities/Project";
import { JMSClient } from "../../brokers/jmsClient";
import { KafkaClient } from "../../brokers/kafkaClient";

function getRandomEnumValue<T extends { [key: string]: any }>(
  enumObj: T
): T[keyof T] {
  const enumValues = Object.values(enumObj) as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
}

export async function seedDatabase(
  queryRunner: QueryRunner,
  dataSource: DataSource
) {
  try {
    console.log("Seeding database...");
    // Start transaction
    await queryRunner.startTransaction();

    // Add JMS client initialization
    const jmsClient = new JMSClient({
      host: "localhost",
      port: 61613,
      username: "admin",
      password: "admin",
    });
    await jmsClient.connect();

    const kafkaClient = new KafkaClient({
      brokers: ["localhost:9092"],
      clientId: "seeder-client",
    });
    await kafkaClient.connect();

    // Create agencies
    const agencies: Agency[] = [];
    const numberOfAgencies = 1000;

    for (let i = 0; i < numberOfAgencies; i++) {
      const agency = new Agency();
      agency.name = faker.company.name();
      agency.address = faker.location.streetAddress();

      const savedAgency = await dataSource.getRepository(Agency).save(agency);
      agencies.push(savedAgency);
    }

    // Send message after creating agencies
    await jmsClient.sendMessage("agency-topic", {
      event: "agencies-created",
      count: agencies.length,
      agencies: agencies.map((a) => ({ id: a.id, name: a.name })),
    });

    await kafkaClient.producer.send({
      topic: "agency-topic",
      messages: [
        {
          value: JSON.stringify({
            event: "agencies-created",
            count: agencies.length,
            agencies: agencies.map((a) => ({ id: a.id, name: a.name })),
          }),
        },
      ],
    });

    // Create users for each agency
    const users: User[] = [];
    const usersPerAgency = 100;

    for (const agency of agencies) {
      for (let i = 0; i < usersPerAgency; i++) {
        const user = new User();
        user.name = faker.person.fullName();
        user.email = faker.internet.email();
        user.agency = agency;

        users.push(user);
      }
    }

    // await dataSource.getRepository(User).save(users);

    // Send message after creating users
    await jmsClient.sendMessage("user-topic", {
      event: "users-created",
      count: users.length,
      users: users.map((u) => ({ id: u.id, email: u.email })),
    });

    await kafkaClient.producer.send({
      topic: "user-topic",
      messages: [
        {
          value: JSON.stringify({
            event: "users-created",
            count: users.length,
            users: users.map((u) => ({ id: u.id, email: u.email })),
          }),
        },
      ],
    });

    // Create projects for each agency
    const projects: Project[] = [];
    const projectsPerAgency = 2;

    for (const agency of agencies) {
      for (let i = 0; i < projectsPerAgency; i++) {
        const project = new Project();
        project.projectName = faker.commerce.productName();
        project.description = faker.commerce.productDescription();
        project.type = getRandomEnumValue(ProjectType);
        project.agency = agency;

        projects.push(project);
      }
    }

    // await dataSource.getRepository(Project).save(projects);

    // Send message after creating projects
    await jmsClient.sendMessage("project-topic", {
      event: "projects-created",
      count: projects.length,
      projects: projects.map((p) => ({ id: p.id, name: p.projectName })),
    });

    await kafkaClient.producer.send({
      topic: "project-topic",
      messages: [
        {
          value: JSON.stringify({
            event: "projects-created",
            count: projects.length,
            projects: projects.map((p) => ({ id: p.id, name: p.projectName })),
          }),
        },
      ],
    });

    // Commit transaction
    await queryRunner.commitTransaction();

    console.log("Database seeded successfully!");
    console.log(`Created ${agencies.length} agencies`);
    console.log(`Created ${users.length} users`);
    console.log(`Created ${projects.length} projects`);
  } catch (error) {
    // Rollback transaction on error
    await queryRunner.rollbackTransaction();
    console.error("Error seeding database:", error);
  } finally {
    // Release query runner
    await queryRunner.release();
    await dataSource.destroy();
  }
}

// Disable foreign key constraints
// await queryRunner.query(`SET session_replication_role = 'replica';`);

// // Truncate tables
// await queryRunner.query(
//   `TRUNCATE TABLE "project" RESTART IDENTITY CASCADE;`
// );
// await queryRunner.query(`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;`);
// await queryRunner.query(
//   `TRUNCATE TABLE "agency" RESTART IDENTITY CASCADE;`
// );

// // Enable foreign key constraints
// await queryRunner.query(`SET session_replication_role = 'origin';`);

// Clear existing data
// await dataSource.getRepository(Project).clear();
// await dataSource.getRepository(User).clear();
// await dataSource.getRepository(Agency).clear();
