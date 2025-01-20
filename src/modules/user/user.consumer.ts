import { Client } from "@elastic/elasticsearch";
import { JMSClient } from "../../brokers/jmsClient";
import { config } from "../../config";
import { KafkaClient } from "../../brokers/kafkaClient";

const esClient = new Client({
  node: config.elasticsearch.url,
  auth: {
    username: config.elasticsearch.username,
    password: config.elasticsearch.password,
  },
  tls: {
    rejectUnauthorized: false, // Use this only for development/self-signed certificates
  },
});

const jmsClient = new JMSClient({
  host: "localhost",
  port: 61613,
  username: "admin",
  password: "admin",
});

const kafkaClient = new KafkaClient({
  brokers: ["localhost:9092"], // Update with your Kafka broker addresses
  clientId: "my-app-client",
});

// Define interfaces for all message types
interface BaseMessage {
  event: string;
  count: number;
}

interface UserMessage extends BaseMessage {
  users: Array<{
    id: number;
    email: string;
  }>;
}

interface AgencyMessage extends BaseMessage {
  agencies: Array<{
    id: number;
    name: string;
  }>;
}

interface ProjectMessage extends BaseMessage {
  projects: Array<{
    id: number;
    name: string;
  }>;
}

// Generic function to handle Elasticsearch indexing
async function indexToElasticsearch<T>(
  index: string,
  documents: T[],
  eventType: string
) {
  try {
    const operations = documents.flatMap((doc) => [
      { index: { _index: index } },
      {
        ...doc,
        createdAt: new Date(),
        eventType,
      },
    ]);

    const result = await esClient.bulk({ operations });

    if (result.errors) {
      console.error(
        `Elasticsearch bulk operation errors for ${index}:`,
        result.errors
      );
      return false;
    }

    console.log(`Indexed ${documents.length} documents to ${index}`);
    return true;
  } catch (error) {
    console.error(`Error indexing to ${index}:`, error);
    return false;
  }
}

// Start all consumers
export async function startConsumers() {
  try {
    await jmsClient.connect();
    console.log("JMS Client connected");
    // User Consumer
    jmsClient.subscribe("user-topic", async (message: UserMessage) => {
      console.log("JMS Received user message:");
      if (message.event === "users-created") {
        await indexToElasticsearch("users", message.users, message.event);
      }
    });

    // Agency Consumer
    jmsClient.subscribe("agency-topic", async (message: AgencyMessage) => {
      console.log("JMS Received agency message:");
      if (message.event === "agencies-created") {
        await indexToElasticsearch("agencies", message.agencies, message.event);
      }
    });

    // Project Consumer
    jmsClient.subscribe("project-topic", async (message: ProjectMessage) => {
      console.log("JMS Received project message:");
      if (message.event === "projects-created") {
        await indexToElasticsearch("projects", message.projects, message.event);
      }
    });

    console.log(
      "All JMS consumers started and listening to their respective topics"
    );
  } catch (error) {
    console.error("Error starting consumers:", error);
  }
}

// Start all kafka consumers
export async function startKafkaConsumers() {
  try {
    await kafkaClient.connect();
    console.log("Kafka Client connected");

    // Subscribe to all topics first
    await Promise.all([
      kafkaClient.consumer.subscribe({ topic: "user-topic" }),
      kafkaClient.consumer.subscribe({ topic: "agency-topic" }),
      kafkaClient.consumer.subscribe({ topic: "project-topic" }),
    ]);

    // Then start consuming with a single consumer.run
    await kafkaClient.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        const messageData = JSON.parse(message.value.toString());

        switch (topic) {
          case "user-topic":
            if (messageData.event === "users-created") {
              console.log("Kafka Received user message:");
              await indexToElasticsearch(
                "users",
                messageData.users,
                messageData.event
              );
            }
            break;
          case "agency-topic":
            if (messageData.event === "agencies-created") {
              console.log("Kafka Received agency message:");
              await indexToElasticsearch(
                "agencies",
                messageData.agencies,
                messageData.event
              );
            }
            break;
          case "project-topic":
            if (messageData.event === "projects-created") {
              console.log("Kafka Received project message:");
              await indexToElasticsearch(
                "projects",
                messageData.projects,
                messageData.event
              );
            }
            break;
        }
      },
    });

    console.log("Kafka consumer started and listening to all topics");
  } catch (error) {
    console.error("Error starting Kafka consumers:", error);
  }
}
