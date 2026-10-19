// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Factory.sol";
import "./Pair.sol";

/**
 * 路由合约，封装 approve/转账/调 Pair等流程
 */
contract Router {
    Factory public factory;

    constructor(address _factory) {
        factory = Factory(_factory);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "INVALID_INPUT");
        uint256 inWithFee = amountIn * 997;
        return (reserveOut * inWithFee) / (reserveIn * 1000 + inWithFee);
    }

    /**
     * 返回liquidity:获得的LP数量
     */
    function addLiquidity(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired
    ) external returns (uint256 liquidity) {
        address pair = factory.getPair(tokenA, tokenB);
        if (pair == address(0)) pair = factory.createPair(tokenA, tokenB);
        // 把用户代币拉到 Pair 合约
        IERC20(tokenA).transferFrom(msg.sender, pair, amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountBDesired);
        liquidity = Pair(pair).mint(msg.sender);
    }

    /**
     * 移除流动性之前，需要前端先给Router做approve处理
     */
    function removeLiquidity(address tokenA, address tokenB, uint256 liquidity) external returns (uint256 a0, uint256 a1) {
        address pair = factory.getPair(tokenA, tokenB);
        require(pair != address(0), "NO_PAIR");
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (a0, a1) = Pair(pair).burn(msg.sender);
    }


    function swapExactIn(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to)
        external returns (uint256 amountOut) {
        address pair = factory.getPair(tokenIn, tokenOut);
        require(pair != address(0), "NO_PAIR");
        (uint112 r0, uint112 r1) = Pair(pair).getReserves();
        address t0 = Pair(pair).token0();
        (uint256 rIn, uint256 rOut) = tokenIn == t0 ? (r0, r1) : (r1, r0);
        amountOut = getAmountOut(amountIn, rIn, rOut);
        require(amountOut >= amountOutMin, "SLIPPAGE");
        IERC20(tokenIn).transferFrom(msg.sender, pair, amountIn);
        Pair(pair).swap(tokenIn, amountOut, to);
    }

    /**
     * 前端 swap 输入时实时显示预期输出
     */
    function quote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256) {
        address pair = factory.getPair(tokenIn, tokenOut);
        if (pair == address(0)) return 0;
        (uint112 r0, uint112 r1) = Pair(pair).getReserves();
        address t0 = Pair(pair).token0();
        (uint256 rIn, uint256 rOut) = tokenIn == t0 ? (r0, r1) : (r1, r0);
        if (rIn == 0 || rOut == 0) return 0;
        return getAmountOut(amountIn, rIn, rOut);
    }
}
