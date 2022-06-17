import "dotenv/config"
import "tsconfig-paths/register"
import "@nomiclabs/hardhat-ethers"

const accounts = {
    mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
    accountsBalance: "1000000000000000000000000",
}

module.exports = {
    networks: {
        hardhat: {
            chainId: 1,
            accounts,
            forking: {
                url: process.env.FORK_NODE_RPC_URL,
            },
            allowUnlimitedContractSize: true,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },
}
