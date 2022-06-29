// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

library LibBytes {
    function readBytes32(
        bytes memory b,
        uint256 index
    ) internal pure returns (bytes32 result) {
        require(b.length >= index + 32, "Bytes length not enough");
        index += 32;
        assembly {
            result := mload(add(b, index))
        }
        return result;
    }
}
