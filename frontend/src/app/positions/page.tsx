"use client";
// Position 页面：查看我的 LP 余额 + 移除流动性
import { useState } from "react";
import { Card, Button, Input, message } from "antd";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { factoryAbi, pairAbi, routerAbi, erc20Abi } from "../../abis";
import addrs from "../../addresses.json";

export default function PositionsPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const factory = (addrs as any).factory as Address;
  const router = (addrs as any).router as Address;
  const RTA = (addrs as any).RTA as Address, RTB = (addrs as any).RTB as Address;
  const [liq, setLiq] = useState("1");

  const { data: pair } = useReadContract({ address: factory, abi: factoryAbi, functionName: "getPair", args: [RTA, RTB] });
  const { data: bal } = useReadContract({
    address: (pair as Address) ?? undefined, abi: pairAbi, functionName: "balanceOf",
    args: address ? [address] : undefined, query: { enabled: !!pair && !!address },
  });

  const remove = async () => {
    try {
      const v = parseEther(liq);
      await writeContractAsync({ address: pair as Address, abi: erc20Abi, functionName: "approve", args: [router, v] });
      await writeContractAsync({ address: router, abi: routerAbi, functionName: "removeLiquidity", args: [RTA, RTB, v] });
      message.success("移除成功");
    } catch (e: any) { message.error(e?.shortMessage ?? "失败"); }
  };

  return (
    <Card title="我的头寸 (RTA-RTB)">
      <p>池地址：{(pair as string) ?? "-"}</p>
      <p>我的 LP：{bal ? formatEther(bal as bigint) : "0"}</p>
      <Input value={liq} onChange={(e) => setLiq(e.target.value)} placeholder="移除 LP 数量" style={{ marginBottom: 8 }} />
      <Button danger block onClick={remove} disabled={!address}>Approve LP + Remove</Button>
    </Card>
  );
}
