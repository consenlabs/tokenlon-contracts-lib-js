// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

interface ITokenlon {
    function toAMM(bytes calldata _payload) external payable;
}
