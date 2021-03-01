import { readFileSync } from "fs";
import Websocket from "ws";
import startWSServer from "./server";
import { OperationCodeEnum } from "./session";

it("test server", () => {
  return new Promise((resolve, reject) => {
    startWSServer();
    const ccp = JSON.parse(
      readFileSync(
        "/Users/chenjienan/fabric-fs-desktop/test_data/profile.json"
      ).toString()
    );
    const identity = JSON.parse(
      readFileSync(
        "/Users/chenjienan/fabric-fs-desktop/test_data/wallet/gmyx.id"
      ).toString()
    );

    const ws = new Websocket("ws://localhost:2333");

    ws.on("open", () => {
      ws.ping();
      ws.send(
        JSON.stringify({
          txID: "123123",
          code: OperationCodeEnum.CONNECT,
          data: {
            username: "gmyx",
            ccp,
            channelID: "mychannel",
            identity,
          },
        })
      );
      ws.on("message", (data) => {
        console.log(data);
        resolve(undefined)
      });
      ws.on("ping", () => {
        ws.pong();
      });
    });
  });
});
