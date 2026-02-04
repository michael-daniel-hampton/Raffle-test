"use client";

import { useEffect, useState } from "react";
import { devSessionStorage } from "@raffle/shared";

export function DevSessionWidget() {
  const [aliasId, setAliasId] = useState("");
  const [kycVerified, setKycVerified] = useState(false);

  useEffect(() => {
    const session = devSessionStorage.get();
    if (session) {
      setAliasId(session.aliasId);
      setKycVerified(session.kycVerified);
    }
  }, []);

  const save = () => {
    if (!aliasId) {
      devSessionStorage.clear();
      return;
    }
    devSessionStorage.set(aliasId, kycVerified);
  };

  return (
    <div>
      <div className="text-slate-400">
      Seller: "seller-1111-2222-3333"
      Buyer: "buyer-aaaa-bbbb-cccc"
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-xs">
        <span className="text-slate-400">Dev Session</span>
        <input
          className="w-40 rounded bg-slate-800 px-2 py-1 text-slate-100"
          placeholder="alias-id"
          value={aliasId}
          onChange={(event) => setAliasId(event.target.value)}
        />
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={kycVerified}
            onChange={(event) => setKycVerified(event.target.checked)}
          />
          KYC verified
        </label>
        <button
          className="rounded bg-slate-700 px-2 py-1 text-slate-100 hover:bg-slate-600"
          onClick={save}
          type="button"
        >
          Save
        </button>
        <span className="text-slate-500">alias: {aliasId || "none"}</span>
      </div>
    </div>
  );
}
