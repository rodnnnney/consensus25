// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { createEphemeralKeyPair } from "./ephemeral";
import { useKeylessAccounts } from "./useKeylessAccounts";

export default function useEphemeralKeyPair() {
  const { commitEphemeralKeyPair, getEphemeralKeyPair } = useKeylessAccounts();

  const ephemeralKeyPair = useMemo(() => {
    let keyPair = getEphemeralKeyPair();

    // Only create a new key pair if the existing one is expired or doesn't exist
    if (!keyPair || keyPair.isExpired()) {
      keyPair = createEphemeralKeyPair();
      commitEphemeralKeyPair(keyPair);
    }

    return keyPair;
  }, [commitEphemeralKeyPair, getEphemeralKeyPair]);

  return ephemeralKeyPair;
}
