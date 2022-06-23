// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "./interfaces/token/IERC20.sol";
import "./libs/LibBytes.sol";

contract ERC1271Wallet {
    using LibBytes for bytes;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "ERC1271Wallet: Only contract owner");
        _;
    }

    function approve(address spender, address tokenAddr, uint256 amount) public onlyOwner {
        IERC20(tokenAddr).approve(spender, amount);
    }

    function isValidSignature(bytes32 hash, bytes memory signature) public view returns (bytes4) {
        require(owner == _ecrecover(hash, signature), "ERC1271Wallet: Invalid signature");
        return 0x1626ba7e;
    }

    function _ecrecover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        uint8 v = uint8(signature[64]);
        bytes32 r = signature.readBytes32(0);
        bytes32 s = signature.readBytes32(32);
        return ecrecover(hash, v, r, s);
    }
}
