import "dotenv/config"
import "@nomiclabs/hardhat-ethers"

const accounts = {
    mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
    accountsBalance: "1000000000000000000000000",
}
const MAINNET_NODE_RPC_URL = process.env.MAINNET_NODE_RPC_URL || ""

module.exports = {
    networks: {
        hardhat: {
            chainId: 1,
            accounts,
            forking: {
                url: `${MAINNET_NODE_RPC_URL}`,
            },
            allowUnlimitedContractSize: true,
        },
    },
}
