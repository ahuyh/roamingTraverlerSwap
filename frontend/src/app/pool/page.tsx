"use client";
// pool 页面：查看所有池子 + 创建池子 + 加流动性
import { useState } from "react";
import { Card, Button, Input, message, List } from "antd";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther, type Address, zeroAddress } from "viem";
import { factoryAbi, pairAbi, routerAbi, erc20Abi } from "../../abis";
import addrs from "../../addresses.json";

function PoolItem({ pair, tokenA, tokenB }: { pair: Address; tokenA: string; tokenB: string }) {
  const { data } = useReadContract({ address: pair, abi: pairAbi, functionName: "getReserves" });
  const r = (data as any) as [bigint, bigint] | undefined;
  return <List.Item>{pair.slice(0, 10)}… | {tokenA.slice(0,6)}-{tokenB.slice(0,6)} | 储备: {r ? `${formatEther(r[0])} / ${formatEther(r[1])}` : "-"}</List.Item>;
}

export default function PoolPage() {
  const { writeContractAsync } = useWriteContract();
  const factory = (addrs as any).factory as Address;
  const router = (addrs as any).router as Address;
  // 读取池子总数
  const { data: len } = useReadContract({ address: factory, abi: factoryAbi, functionName: "allPairsLength" });
  const n = Number((len as bigint) ?? 0n);
  const [a, setA] = useState((addrs as any).RTA);
  const [b, setB] = useState((addrs as any).RTB);
  const [qa, setQa] = useState("10");
  const [qb, setQb] = useState("10");

  // 逐个读取池地址
  const PairRow = ({ i }: { i: number }) => {
    const { data: p } = useReadContract({ address: factory, abi: factoryAbi, functionName: "allPairs", args: [BigInt(i)] });
    if (!p || p === zeroAddress) return null;
    return <PoolItem pair={p as Address} tokenA={a} tokenB={b} />;
  };

  const create = async () => {
    try { await writeContractAsync({ address: factory, abi: factoryAbi, functionName: "createPair", args: [a as Address, b as Address] }); message.success("创建成功"); }
    catch (e: any) { message.error(e?.shortMessage ?? "已存在或地址非法"); }
  };
  const add = async () => {
    try {
      const va = parseEther(qa), vb = parseEther(qb);
      await writeContractAsync({ address: a as Address, abi: erc20Abi, functionName: "approve", args: [router, va] });
      await writeContractAsync({ address: b as Address, abi: erc20Abi, functionName: "approve", args: [router, vb] });
      await writeContractAsync({ address: router, abi: routerAbi, functionName: "addLiquidity", args: [a as Address, b as Address, va, vb] });
      message.success("加池成功");
    } catch (e: any) { message.error(e?.shortMessage ?? "失败"); }
  };

  return (<>
    <Card title="所有交易池" style={{ marginBottom: 16 }}>
      <List dataSource={Array.from({ length: n }, (_, i) => i)} renderItem={(i) => <PairRow key={i} i={i} />} />
    </Card>
    <Card title="创建交易池">
      <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="tokenA 地址" style={{ marginBottom: 8 }} />
      <Input value={b} onChange={(e) => setB(e.target.value)} placeholder="tokenB 地址" style={{ marginBottom: 8 }} />
      <Button onClick={create} block>创建池子</Button>
    </Card>
    <Card title="添加流动性" style={{ marginTop: 16 }}>
      <Input value={qa} onChange={(e) => setQa(e.target.value)} placeholder="数量A" style={{ marginBottom: 8 }} />
      <Input value={qb} onChange={(e) => setQb(e.target.value)} placeholder="数量B" style={{ marginBottom: 8 }} />
      <Button type="primary" onClick={add} block>Approve + AddLiquidity</Button>
    </Card>
  </>);
}
