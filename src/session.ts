import WebSocket from "ws";
import { FabricClient, FabricClientOptions } from "./fabricClient";

export enum OperationCodeEnum {
  CONNECT = 0,
  EVALUATE = 1,
  SUBMIT = 2,
}
type Handler = (data: any) => any;

interface Request {
  txID: string;
  code: OperationCodeEnum;
  data: any;
}

function parseResponse(response?: Buffer) {
  if (!response) return undefined;
  try {
    return JSON.parse(response.toString());
  } catch (error) {
    return response.toString();
  }
}

export class Session {
  private ws: WebSocket;
  alive: boolean = true;
  private interval?: any;
  private client?: FabricClient;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.keepAlive();

    this.ws.on("message", async (data) => {
      const cookedData = JSON.parse(data.toString()) as Request;

      let response;

      const respond = (data: any) => {
        this.ws.send(JSON.stringify(data));
      };

      try {
        switch (cookedData.code) {
          case OperationCodeEnum.CONNECT:
            response = await this.connectFabric(cookedData.data);
            respond({ txID: cookedData.txID, data: response });
            break;
          case OperationCodeEnum.EVALUATE:
            response = await this.client?.evaluate(
              cookedData.data.functionName,
              ...cookedData.data.args
            );
            respond({
              txID: cookedData.txID,
              data: parseResponse(response),
            });
            break;
          case OperationCodeEnum.SUBMIT:
            response = await this.client?.submit(
              cookedData.data.functionName,
              ...cookedData.data.args
            );
            respond({
              txID: cookedData.txID,
              data: parseResponse(response),
            });
        }
      } catch (error: any) {
        console.error(error);
        console.log("fail to process: " + data.toString());
        this.ws.send(
          JSON.stringify({ txID: cookedData.txID, error: error.toString() })
        );
      }
    });

    this.ws.on("ping", () => {
      ws.pong();
    });
  }

  async connectFabric(options: FabricClientOptions) {
    this.client = new FabricClient();
    await this.client.init(options);
    this.ws.on("close", () => [this.client?.disconnect()]);
  }

  keepAlive() {
    this.interval = setInterval(() => {
      if (this.alive) {
        this.alive = false;
        this.ws.ping();
      } else {
        this.ws.terminate();
      }
    }, 5000);

    this.ws.on("pong", () => {
      this.alive = true;
    });

    this.ws.on("close", () => {
      clearInterval(this.interval);
    });
  }
}
