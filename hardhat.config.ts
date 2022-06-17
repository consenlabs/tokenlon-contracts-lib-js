import "dotenv/config"
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
                url: process.env.MAINNET_NODE_RPC_URL,
            },
            allowUnlimitedContractSize: true,
        },
    },
}
