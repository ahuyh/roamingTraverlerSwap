// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// OpenZeppelin的标准ERC20实现，用于创建测试代币
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply);
    }

    ///水龙头，测试环境领币
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
