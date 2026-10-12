// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Pair is ERC20 {
    // 池中的两种代币地址，按大小排序保证唯一性
    address public token0; 
    address public token1;
    uint112 public reserve0;
    uint112 public reserve1;
    // 最小流动性锁定，防止首次添加时被操纵
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1);
    event Swap(address indexed sender, uint256 amountIn, address tokenIn, uint256 amountOut, address tokenOut);
    event Sync(uint112 reserve0, uint112 reserve1);

    constructor() ERC20("RTS-LP", "RTS-LP") {}

    /// Factory部署后调用一次，初始化代币对
    function initialize(address _tokenA, address _tokenB) external {
        require(token0 == address(0), "已初始化过"); 
        (token0, token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA); 
    }

    /// 获取当前储备
    function getReserves() external view returns (uint112, uint112) {
        return (reserve0, reserve1);
    }

    /// 读取真实余额并更新储备
    function _update(uint256 bal0, uint256 bal1) private {
        reserve0 = uint112(bal0);
        reserve1 = uint112(bal1);
        emit Sync(reserve0, reserve1);
    }

    /**
     * 需要先把用户的 token0/token1 代币转入本合约，再调用这个函数
     */
    function mint(address to) external returns (uint256 liquidity) {
        uint256 bal0 = IERC20(token0).balanceOf(address(this));   
        uint256 bal1 = IERC20(token1).balanceOf(address(this)); 
        uint256 amount0 = bal0 - reserve0; // 本次新增的 token0
        uint256 amount1 = bal1 - reserve1; // 本次新增的 token1
        uint256 _total = totalSupply();
        if (_total == 0) {
            uint256 m = amount0 * amount1;
            uint256 s = m / 2 + 1; uint256 y = m;
            while (s < y) { y = s; s = (m / s + s) / 2; }
            liquidity = y - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY);
        } else {
            // 防止用户偏离价格乱加，取二者较小值
            liquidity = (amount0 * _total) / reserve0;
            uint256 l2 = (amount1 * _total) / reserve1;
            if (l2 < liquidity) liquidity = l2;
        }
        // 触发了liquidity不符合条件直接revert,白花gas
        require(liquidity > 0, "不符合条件");
        _mint(to, liquidity);
        _update(bal0, bal1);
        emit Mint(msg.sender, amount0, amount1);
    }

    /**
     * 移除流动性：先把用户的LP转入本合约，再调用burn，按份额退回两种代币
     */
    function burn(address to) external returns (uint256 amount0, uint256 amount1) {
        uint256 liq = balanceOf(address(this));
        uint256 bal0 = IERC20(token0).balanceOf(address(this));
        uint256 bal1 = IERC20(token1).balanceOf(address(this));
        uint256 _total = totalSupply();
        amount0 = (liq * bal0) / _total;
        amount1 = (liq * bal1) / _total;
        require(amount0 > 0 && amount1 > 0, "代币数量不符合条件");
        _burn(address(this), liq);
        IERC20(token0).transfer(to, amount0);
        IERC20(token1).transfer(to, amount1);
        _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)));
        emit Burn(msg.sender, amount0, amount1);
    }

    /**
     * 调用前需把tokenIn转入本合约
     */
    function swap(address tokenIn, uint256 amountOut, address to) external {
        require(tokenIn == token0 || tokenIn == token1, "无效代币");
        require(amountOut > 0, "输出代币不足");
        (uint112 r0, uint112 r1) = (reserve0, reserve1);
        if (tokenIn == token0) {
            IERC20(token1).transfer(to, amountOut);
        } else {
            IERC20(token0).transfer(to, amountOut);
        }
        uint256 bal0 = IERC20(token0).balanceOf(address(this));
        uint256 bal1 = IERC20(token1).balanceOf(address(this));
        // 输入数量 = 新余额 - 旧储备(输出币那边余额减少，所以用新余额校验)
        uint256 amountIn = tokenIn == token0 ? bal0 - r0 : bal1 - r1;
        // 0.3% 手续费：amountIn * 997 / 1000 参与 k 校验
        uint256 bal0Adj = bal0 * 1000 - (tokenIn == token0 ? amountIn * 3 : 0);
        uint256 bal1Adj = bal1 * 1000 - (tokenIn == token1 ? amountIn * 3 : 0);
        require(bal0Adj * bal1Adj >= uint256(r0) * r1 * 1000 * 1000, "K_INVARIANT");
        _update(bal0, bal1);
        emit Swap(msg.sender, amountIn, tokenIn, amountOut, tokenIn == token0 ? token1 : token0);
    }
}
