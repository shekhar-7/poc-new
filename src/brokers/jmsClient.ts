import * as stompit from "stompit";

interface ConnectOptions {
  host: string;
  port: number;
  connectHeaders?: {
    [key: string]: string | undefined;
  };
}

export class JMSClient {
  private client: stompit.Client | undefined;
  private connectionOptions: ConnectOptions;

  constructor(config: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  }) {
    this.connectionOptions = {
      host: config.host || "localhost",
      port: config.port || 61613,
      connectHeaders: {
        host: "/",
        login: config.username || "admin",
        passcode: config.password || "admin",
      },
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      stompit.connect(this.connectionOptions, (error, client) => {
        if (error) {
          reject(error);
          return;
        }
        this.client = client;
        resolve();
      });
    });
  }

  async sendMessage(destination: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const sendHeaders = {
        destination,
        "content-type": "application/json",
      };

      if (!this.client) {
        reject(new Error("Client is not connected"));
        return;
      }

      const frame = this.client.send(sendHeaders);
      frame.write(JSON.stringify(message));
      frame.end();

      resolve();
    });
  }

  async subscribe(
    destination: string,
    callback: (message: any) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscribeHeaders = {
        destination,
        ack: "client-individual",
      };

      if (!this.client) {
        reject(new Error("Client is not connected"));
        return;
      }

      this.client.subscribe(subscribeHeaders, (error, message) => {
        if (error) {
          console.error("Subscribe error:", error);
          return;
        }

        message.readString("utf-8", (error, body) => {
          if (error) {
            console.error("Read message error:", error);
            return;
          }

          try {
            if (!body) {
              console.error("Body is undefined");
              return;
            }
            const parsedMessage = JSON.parse(body);
            callback(parsedMessage);
          } catch (e) {
            console.error("Parse message error:", e);
          }

          this.client?.ack(message);
        });
      });
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
