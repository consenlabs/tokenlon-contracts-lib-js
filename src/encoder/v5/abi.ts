export const abiAMMWrapperWithPath = [
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
]
