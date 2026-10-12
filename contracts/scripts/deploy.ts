import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * 本地部署脚本：
 * 1. 部署 Factory + Router
 * 2. 创建 RTA-RTB 池并加初始流动性
 * 3. 把地址写入 deploy-local.json，并同步到前端 frontend/src/addresses.json
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署者:", deployer.address);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(await factory.getAddress());
  await router.waitForDeployment();

  const Token = await ethers.getContractFactory("MockERC20");
  const one = ethers.parseEther("1000000");
  const rta = await Token.deploy("RoamA", "RTA", one);
  const rtb = await Token.deploy("RoamB", "RTB", one);
  await rta.waitForDeployment();
  await rtb.waitForDeployment();

  const aRTA = await rta.getAddress(), aRTB = await rtb.getAddress();
  const aF = await factory.getAddress(), aR = await router.getAddress();

  // 授权 + 加初始流动性
  const q = ethers.parseEther("1000"), q2 = ethers.parseEther("2000");
  await (await rta.approve(aR, q)).wait();
  await (await rtb.approve(aR, q2)).wait();
  await (await router.addLiquidity(aRTA, aRTB, q, q2)).wait();
  const pair = await factory.getPair(aRTA, aRTB);

  const out = { chainId: 31337, factory: aF, router: aR, RTA: aRTA, RTB: aRTB, pairRTA_RTB: pair };
  fs.writeFileSync(path.join(__dirname, "../deploy-local.json"), JSON.stringify(out, null, 2));
  // 同步给前端
  const fe = path.join(__dirname, "../../frontend/src/addresses.json");
  fs.mkdirSync(path.dirname(fe), { recursive: true });
  fs.writeFileSync(fe, JSON.stringify(out, null, 2));
  console.log("部署完成:", out);
}
main().catch((e) => { console.error(e); process.exit(1); });
