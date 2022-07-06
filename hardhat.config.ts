import "dotenv/config"
import "tsconfig-paths/register"
import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"

import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)

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
                blockNumber: parseInt(process.env.FORK_BLOCK_NUMBER!, 10),
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
    mocha: {
        delay: true,
    },
}
