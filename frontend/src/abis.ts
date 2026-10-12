export const routerAbi = [
  { name: "quote", type: "function", stateMutability: "view", inputs: [{name:"tokenIn",type:"address"},{name:"tokenOut",type:"address"},{name:"amountIn",type:"uint256"}], outputs: [{type:"uint256"}] },
  { name: "swapExactIn", type: "function", stateMutability: "nonpayable", inputs: [{name:"tokenIn",type:"address"},{name:"tokenOut",type:"address"},{name:"amountIn",type:"uint256"},{name:"amountOutMin",type:"uint256"},{name:"to",type:"address"}], outputs: [{type:"uint256"}] },
  { name: "addLiquidity", type: "function", stateMutability: "nonpayable", inputs: [{name:"tokenA",type:"address"},{name:"tokenB",type:"address"},{name:"aD",type:"uint256"},{name:"bD",type:"uint256"}], outputs: [{type:"uint256"}] },
  { name: "removeLiquidity", type: "function", stateMutability: "nonpayable", inputs: [{name:"tokenA",type:"address"},{name:"tokenB",type:"address"},{name:"liq",type:"uint256"}], outputs: [{type:"uint256"},{type:"uint256"}] },
] as const;
export const factoryAbi = [
  { name: "getPair", type: "function", stateMutability: "view", inputs: [{name:"",type:"address"},{name:"",type:"address"}], outputs: [{type:"address"}] },
  { name: "allPairs", type: "function", stateMutability: "view", inputs: [{name:"",type:"uint256"}], outputs: [{type:"address"}] },
  { name: "allPairsLength", type: "function", stateMutability: "view", inputs: [], outputs: [{type:"uint256"}] },
  { name: "createPair", type: "function", stateMutability: "nonpayable", inputs: [{name:"tokenA",type:"address"},{name:"tokenB",type:"address"}], outputs: [{type:"address"}] },
] as const;
export const erc20Abi = [
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs: [{type:"bool"}] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{name:"",type:"address"}], outputs: [{type:"uint256"}] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{type:"string"}] },
  { name: "faucet", type: "function", stateMutability: "nonpayable", inputs: [{name:"amount",type:"uint256"}], outputs: [] },
] as const;
export const pairAbi = [
  { name: "getReserves", type: "function", stateMutability: "view", inputs: [], outputs: [{name:"",type:"uint112"},{name:"",type:"uint112"}] },
  { name: "token0", type: "function", stateMutability: "view", inputs: [], outputs: [{type:"address"}] },
  { name: "token1", type: "function", stateMutability: "view", inputs: [], outputs: [{type:"address"}] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{name:"",type:"address"}], outputs: [{type:"uint256"}] },
] as const;
