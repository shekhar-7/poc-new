import {
  Kafka,
  Consumer,
  Producer,
  EachMessagePayload,
  logLevel as LogLevel,
} from "kafkajs";

export class KafkaClient {
  private kafka: Kafka;
  public producer: Producer;
  public consumer: Consumer;
  private messageHandlers: Map<string, Function>;

  constructor(config: { brokers: string[]; clientId: string }) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      logLevel: LogLevel.NOTHING,
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: `${config.clientId}-group`,
    });
    this.messageHandlers = new Map();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async subscribe<T>(
    topic: string,
    handler: (message: T) => Promise<void>
  ): Promise<void> {
    this.messageHandlers.set(topic, handler);

    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          const handler = this.messageHandlers.get(topic);
          if (handler && message.value) {
            const messageData = JSON.parse(message.value.toString()) as T;
            await handler(messageData);
          }
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });
  }

  async publish<T>(topic: string, message: T): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });
    } catch (error) {
      console.error(`Error publishing message to topic ${topic}:`, error);
      throw error;
    }
  }
}
