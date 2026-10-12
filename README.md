
# 终端1：启动本地链
cd contracts; npm install; npx hardhat compile; npx hardhat node
# 终端2：部署合约
cd contracts; npm run deploy:local
# 终端3：启动前端
cd frontend; npm install; npm run dev



