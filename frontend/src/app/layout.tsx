"use client";
import React from "react";
import { WagmiWeb3ConfigProvider, MetaMask } from "@ant-design/web3-wagmi";
import { Hardhat } from "@ant-design/web3-assets";
import { Button, Space } from "antd";
import { useAccount, useConnect, useDisconnect } from "wagmi";


function DirectConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  if (isConnected) return <Space><span style={{ color: "#fff" }}>{address?.slice(0, 6)}…{address?.slice(-4)}</span><Button size="small" onClick={() => disconnect()}>断开</Button></Space>;
  const mm = connectors.find((c) => c.name === "MetaMask") ?? connectors[0];
  const onConnect = () => { if (!isPending) connect({ connector: mm }); };
  return (
    <Space>
      <Button type="primary" size="small" loading={isPending} disabled={isPending} onClick={onConnect} title={error?.message ?? ""}>连接MetaMask</Button>
    </Space>
  );
}
import { Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { wagmiConfig } from "../wagmi";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <html lang="zh-CN"><body suppressHydrationWarning>
      <WagmiWeb3ConfigProvider config={wagmiConfig} wallets={[MetaMask()]} chains={[Hardhat]}>
        <Layout style={{ minHeight: "100vh" }}>
          <Layout.Header style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ color: "#fff", fontWeight: 700 }}>RoamingTraverlerSwap</div>
            <Menu theme="dark" mode="horizontal" selectedKeys={[path]} items={[
              { key: "/", label: <Link href="/">Swap</Link> },
              { key: "/pool", label: <Link href="/pool">Pool</Link> },
              { key: "/positions", label: <Link href="/positions">Positions</Link> },
            ]} style={{ flex: 1 }} />
            <DirectConnect />
          </Layout.Header>
          <Layout.Content style={{ padding: 24, maxWidth: 800, margin: "0 auto", width: "100%" }}>
            {children}
          </Layout.Content>
        </Layout>
      </WagmiWeb3ConfigProvider>
    </body></html>
  );
}
