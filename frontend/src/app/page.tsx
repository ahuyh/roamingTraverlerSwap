"use client";
// Swap页面
import { useState, useEffect } from "react";
import { Card, Input, Button, Select, message } from "antd";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { routerAbi, erc20Abi } from "../abis";
import addrs from "../addresses.json";

export default function SwapPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [tokenIn, setTokenIn] = useState<Address>((addrs as any).RTA as Address);
  const RTA = (addrs as any).RTA as Address, RTB = (addrs as any).RTB as Address;
  const router = (addrs as any).router as Address;
  const tokenOut = tokenIn === RTA ? RTB : RTA;
  const [amt, setAmt] = useState("1");

  useEffect(() => {
    const fetchInfo = async () => {
      const res = await fetch("/api/info");
      const data = await res.json();
      console.log(data.contracts.router);
    };
    fetchInfo(); 
  }, []);

  // 实时报价
  const { data: out } = useReadContract({
    address: router, abi: routerAbi, functionName: "quote",
    args: (() => { try { return [tokenIn, tokenOut, parseEther(amt || "0")]; } catch { return undefined; } })() as any,
    query: { enabled: !!amt },
  });

  const doSwap = async () => {
    try {
      const v = parseEther(amt);
      await writeContractAsync({ address: tokenIn, abi: erc20Abi, functionName: "approve", args: [router, v] });
      const min = ((out as bigint) ?? 0n) * 95n / 100n; // 5% 滑点保护
      await writeContractAsync({ address: router, abi: routerAbi, functionName: "swapExactIn", args: [tokenIn, tokenOut, v, min, address!] });
      message.success("Swap 成功");
    } catch (e: any) { message.error(e?.shortMessage ?? "失败"); }
  };

  return (
    <Card title="交易">
      <Select value={tokenIn} onChange={setTokenIn} style={{ width: "100%", marginBottom: 12 }}
        options={[{ value: RTA, label: `RTA ${RTA.slice(0, 6)}` }, { value: RTB, label: `RTB ${RTB.slice(0, 6)}` }]} />
      <Input value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="输入数量" />
      <p style={{ marginTop: 12 }}>预期输出：{out ? formatEther(out as bigint) : "-"} {tokenOut === RTA ? "RTA" : "RTB"}</p>
      <Button type="primary" block onClick={doSwap} disabled={!address}>Swap</Button>
    </Card>
  );
}
