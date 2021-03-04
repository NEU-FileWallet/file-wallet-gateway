import WebSocket from "ws";
import { Session } from "./session";

export default function startWSServer() {
  console.log("Initializing WebSocket Server");

  const ws = new WebSocket.Server({ port: 2333 });

  ws.on("connection", (connection, req) => {
    console.log(
      "accepting new connection"
    );
    new Session(connection);
  });

  console.log("Initialization finished");
}
