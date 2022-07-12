// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

interface IUserProxy {
    function toAMM(bytes calldata _payload) external payable;
    function toLimitOrder(bytes calldata _payload) external payable;
    function toRFQ(bytes calldata _payload) external payable;
}
