
import { NextResponse } from "next/server";
import addrs from "../../../addresses.json";

export async function GET() {
  return NextResponse.json({
    name: "RoamingTraverlerSwap",
    chainId: (addrs as any).chainId,
    contracts: {
      factory: (addrs as any).factory,
      router: (addrs as any).router,
      RTA: (addrs as any).RTA,
      RTB: (addrs as any).RTB,
    },
    tip: "api test",
  });
}

