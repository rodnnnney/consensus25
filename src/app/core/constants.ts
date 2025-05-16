// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
export const LocalStorageKeys = {
  keylessAccounts: "@aptos-connect/keyless-accounts",
};

export const testnetClient = new Aptos(
  new AptosConfig({ 
    network: Network.TESTNET,
    // Use public RPC endpoints
    fullnode: "https://fullnode.testnet.aptoslabs.com/v1",
    indexer: "https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql"
  })
);

export const GOOGLE_CLIENT_ID = "489298120493-hn1djokaafumh7qtadq5ehnje0b4rg8k.apps.googleusercontent.com";
