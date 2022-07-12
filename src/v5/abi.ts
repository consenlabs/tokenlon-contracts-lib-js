export default {
    AMMWrapper: [
        /* trade */
        {
            inputs: [
                {
                    internalType: "address",
                    name: "_makerAddr",
                    type: "address",
                },
                {
                    internalType: "address",
                    name: "_takerAssetAddr",
                    type: "address",
                },
                {
                    internalType: "address",
                    name: "_makerAssetAddr",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "_takerAssetAmount",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_makerAssetAmount",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_feeFactor",
                    type: "uint256",
                },
                {
                    internalType: "address",
                    name: "_userAddr",
                    type: "address",
                },
                {
                    internalType: "address payable",
                    name: "_receiverAddr",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "_salt",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_deadline",
                    type: "uint256",
                },
                {
                    internalType: "bytes",
                    name: "_sig",
                    type: "bytes",
                },
            ],
            name: "trade",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "payable",
            type: "function",
        },
    ],
    AMMWrapperWithPath: [
        /* trade */
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: "address",
                            name: "makerAddr",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "takerAssetAddr",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "makerAssetAddr",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "takerAssetAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "makerAssetAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "userAddr",
                            type: "address",
                        },
                        {
                            internalType: "address payable",
                            name: "receiverAddr",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "deadline",
                            type: "uint256",
                        },
                    ],
                    internalType: "struct IAMMWrapperWithPath.Order",
                    name: "_order",
                    type: "tuple",
                },
                {
                    internalType: "uint256",
                    name: "_feeFactor",
                    type: "uint256",
                },
                {
                    internalType: "bytes",
                    name: "_sig",
                    type: "bytes",
                },
                {
                    internalType: "bytes",
                    name: "_makerSpecificData",
                    type: "bytes",
                },
                {
                    internalType: "address[]",
                    name: "_path",
                    type: "address[]",
                },
            ],
            name: "trade",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "payable",
            type: "function",
        },
    ],
    LimitOrder: [
        /* fillLimitOrderByTrader */
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: "address",
                            name: "makerToken",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "takerToken",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "makerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "takerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "maker",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "taker",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                    ],
                    internalType: "struct ILimitOrder.Order",
                    name: "_order",
                    type: "tuple",
                },
                {
                    internalType: "bytes",
                    name: "_orderMakerSig",
                    type: "bytes",
                },
                {
                    components: [
                        {
                            internalType: "address",
                            name: "taker",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "recipient",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "takerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                        {
                            internalType: "bytes",
                            name: "takerSig",
                            type: "bytes",
                        },
                    ],
                    internalType: "struct ILimitOrder.TraderParams",
                    name: "_params",
                    type: "tuple",
                },
                {
                    components: [
                        {
                            internalType: "bytes",
                            name: "sig",
                            type: "bytes",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                    ],
                    internalType: "struct ILimitOrder.CoordinatorParams",
                    name: "_crdParams",
                    type: "tuple",
                },
            ],
            name: "fillLimitOrderByTrader",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "nonpayable",
            type: "function",
        },
        /* fillLimitOrderByProtocol */
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: "address",
                            name: "makerToken",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "takerToken",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "makerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "takerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "maker",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "taker",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                    ],
                    internalType: "struct ILimitOrder.Order",
                    name: "_order",
                    type: "tuple",
                },
                {
                    internalType: "bytes",
                    name: "_orderMakerSig",
                    type: "bytes",
                },
                {
                    components: [
                        {
                            internalType: "enum ILimitOrder.Protocol",
                            name: "protocol",
                            type: "uint8",
                        },
                        {
                            internalType: "bytes",
                            name: "data",
                            type: "bytes",
                        },
                        {
                            internalType: "address",
                            name: "profitRecipient",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "takerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "protocolOutMinimum",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                    ],
                    internalType: "struct ILimitOrder.ProtocolParams",
                    name: "_params",
                    type: "tuple",
                },
                {
                    components: [
                        {
                            internalType: "bytes",
                            name: "sig",
                            type: "bytes",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                    ],
                    internalType: "struct ILimitOrder.CoordinatorParams",
                    name: "_crdParams",
                    type: "tuple",
                },
            ],
            name: "fillLimitOrderByProtocol",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "nonpayable",
            type: "function",
        },
        /* cancelLimitOrder */
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: "address",
                            name: "makerToken",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "takerToken",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "makerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "takerTokenAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "maker",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "taker",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint64",
                            name: "expiry",
                            type: "uint64",
                        },
                    ],
                    internalType: "struct ILimitOrder.Order",
                    name: "_order",
                    type: "tuple",
                },
                {
                    internalType: "bytes",
                    name: "_cancelMakerSig",
                    type: "bytes",
                },
            ],
            name: "cancelLimitOrder",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
    ],
    RFQ: [
        /* fill */
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: "address",
                            name: "takerAddr",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "makerAddr",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "takerAssetAddr",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "makerAssetAddr",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "takerAssetAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "makerAssetAmount",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "receiverAddr",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "salt",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "deadline",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "feeFactor",
                            type: "uint256",
                        },
                    ],
                    internalType: "struct IRFQ.Order",
                    name: "_order",
                    type: "tuple",
                },
                {
                    internalType: "bytes",
                    name: "_mmSignature",
                    type: "bytes",
                },
                {
                    internalType: "bytes",
                    name: "_userSignature",
                    type: "bytes",
                },
            ],
            name: "fill",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "payable",
            type: "function",
        },
    ],
}
