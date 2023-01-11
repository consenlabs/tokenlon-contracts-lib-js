// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
pragma abicoder v2;

interface IL2Deposit {
    enum L2Identifier {
        Arbitrum,
        Optimism
    }
    struct Deposit {
        L2Identifier l2Identifier;
        address l1TokenAddr;
        address l2TokenAddr;
        address sender;
        address recipient;
        uint256 amount;
        uint256 salt;
        uint256 expiry;
        bytes data;
    }

    struct DepositParams {
        Deposit deposit;
        bytes depositSig;
    }

    event Deposited(
        L2Identifier indexed l2Identifier,
        address indexed l1TokenAddr,
        address l2TokenAddr,
        address indexed sender,
        address recipient,
        uint256 amount,
        bytes data,
        bytes bridgeResponse
    );

    function deposit(DepositParams calldata _params) external payable;
}
