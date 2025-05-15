// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { Aptos, AptosConfig, ClientConfig, Network } from "@aptos-labs/ts-sdk";
export const LocalStorageKeys = {
  keylessAccounts: "@aptos-connect/keyless-accounts",
};

interface Args {
  nodeApiUrl: string;
  apiKey: string;
}

export const testnetClient = new Aptos(
  new AptosConfig({ 
    network: Network.TESTNET
  })
);

export const testnetClient1 = async () => {
  const clientConfig: ClientConfig = {
    API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY
  };
  const config = new AptosConfig({
    fullnode: 'https://testnet.aptoslabs.com',
    network: Network.TESTNET,
    clientConfig
  });
  return new Aptos(config);
};

export const GOOGLE_CLIENT_ID = "489298120493-hn1djokaafumh7qtadq5ehnje0b4rg8k.apps.googleusercontent.com";
