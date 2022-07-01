// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "./ERC1271Wallet.sol";

contract ERC1271WalletETHSign is ERC1271Wallet {
    function _transform(bytes32 hash) internal override pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
