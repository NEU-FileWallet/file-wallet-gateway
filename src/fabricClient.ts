import {
  Contract,
  Gateway,
  Wallet,
  Wallets,
  X509Identity,
} from "fabric-network";

export interface FabricClientOptions {
  ccp: any;
  username: string;
  identity: X509Identity;
  channelID: string;
}

export class FabricClient {
  private gateway?: Gateway;
  private wallet?: Wallet;
  private contract?: Contract;

  async init({ username, identity, ccp, channelID }: FabricClientOptions) {
    this.wallet = await Wallets.newInMemoryWallet();
    await this.wallet.put(username, identity);
    await this.connectFabric(username, ccp, channelID);
  }

  private async connectFabric(username: string, ccp: any, channelID: string) {
    this.gateway = new Gateway();

    await this.gateway.connect(ccp, {
      wallet: this.wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: false },
    });

    const network = await this.gateway.getNetwork(channelID);
    this.contract = network.getContract("file_wallet");
    console.log("fabric connected");
  }

  evaluate(functionName: string, ...args: string[]) {
    console.log({ functionName, args });
    return this.contract?.evaluateTransaction(functionName, ...args);
  }

  submit(functionName: string, ...args: string[]) {
    console.log({ functionName, args });
    return this.contract?.submitTransaction(functionName, ...args);
  }

  disconnect() {
    this.gateway?.disconnect();
    console.log("fabric disconnected");
  }
}
