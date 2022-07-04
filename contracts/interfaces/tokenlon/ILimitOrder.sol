// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
pragma abicoder v2;

interface ILimitOrder {
    struct Order {
        address makerToken;
        address takerToken;
        uint256 makerTokenAmount;
        uint256 takerTokenAmount;
        address maker;
        address taker;
        uint256 salt;
        uint64 expiry;
    }

    struct FillReceipt {
        address makerToken;
        address takerToken;
        uint256 makerTokenFilledAmount;
        uint256 takerTokenFilledAmount;
        uint256 remainingAmount;
        uint256 makerTokenFee;
        uint256 takerTokenFee;
    }

    /* operating */

    function operator() external view returns (address);
    function coordinator() external view returns (address);
    function upgradeCoordinator(address _newCoordinator) external;

    /* fillLimitOrderByTrader */

    struct CoordinatorParams {
        bytes sig;
        uint256 salt;
        uint64 expiry;
    }

    struct TraderParams {
        address taker;
        address recipient;
        uint256 takerTokenAmount;
        uint256 salt;
        uint64 expiry;
        bytes takerSig;
    }

    event LimitOrderFilledByTrader(
        bytes32 indexed orderHash,
        address indexed maker,
        address indexed taker,
        bytes32 allowFillHash,
        address recipient,
        FillReceipt fillReceipt
    );

    function fillLimitOrderByTrader(
        Order calldata _order,
        bytes calldata _orderMakerSig,
        TraderParams calldata _params,
        CoordinatorParams calldata _crdParams
    ) external returns (uint256, uint256);


    /* fillLimitOrderByProtocol */

    enum Protocol {
        UniswapV3,
        Sushiswap
    }

    struct ProtocolParams {
        Protocol protocol;
        bytes data;
        address profitRecipient;
        uint256 takerTokenAmount;
        uint256 protocolOutMinimum;
        uint64 expiry;
    }

    event LimitOrderFilledByProtocol(
        bytes32 indexed orderHash,
        address indexed maker,
        address indexed taker,
        bytes32 allowFillHash,
        address relayer,
        address profitRecipient,
        FillReceipt fillReceipt,
        uint256 takerTokenProfit,
        uint256 takerTokenProfitFee,
        uint256 takerTokenProfitBackToMaker
    );

    function fillLimitOrderByProtocol(
        Order calldata _order,
        bytes calldata _orderMakerSig,
        ProtocolParams calldata _params,
        CoordinatorParams calldata _crdParams
    ) external returns (uint256);

    /* cancelLimitOrder */

    event OrderCancelled(bytes32 orderHash, address maker);

    function cancelLimitOrder(Order calldata _order, bytes calldata _cancelMakerSig) external;
}
