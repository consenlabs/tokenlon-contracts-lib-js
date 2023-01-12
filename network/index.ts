export enum Network {
    Mainnet = 1,
    Goerli = 5,
    Optimism = 10,
    OptimismGoerli = 420,
    Arbitrum = 42161,
    ArbitrumGoerli = 421613,
}

enum NetworkFilePath {
    EthereumMainnet = Network.Mainnet,
    EthereumGoerli = Network.Goerli,
    OptimismMainnet = Network.Optimism,
    OptimismGoerli = Network.OptimismGoerli,
    ArbitrumMainnet = Network.Arbitrum,
    ArbitrumGoerli = Network.ArbitrumGoerli,
}

const network = (() => {
    const network = parseInt(process.env.CHAIN_ID ?? "0", 10)
    if (!Network[network]) {
        throw new Error(`Unknown network ${network}`)
    }
    return network
})()

export function isNetwork(...networks: Network[]): boolean {
    return networks.includes(network)
}

export type Addresses = {
    // Token
    DAI: string
    USDC: string
    USDT: string
    WETH: string

    // Tokenlon
    AllowanceTarget: string
    AMMWrapper: string
    AMMWrapperWithPath: string
    LimitOrder: string
    RFQ: string
    L2Deposit: string
    UserProxy: string

    // Uniswap
    UniswapV2Router: string
    UniswapV3Quoter: string
    UniswapV3Router: string

    // Sushiswap
    SushiswapRouter: string

    // Curve
    Curve3Pool: string
}

export const addresses = require(`.${NetworkFilePath[network]
    .replace(/([A-Z])/g, "/$1")
    .toLowerCase()}.ts`).default as Addresses
