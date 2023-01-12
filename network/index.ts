export enum Network {
    EthereumMainnet = 1,
    EthereumGoerli = 5,
    OptimismMainnet = 10,
    OptimismGoerli = 420,
    ArbitrumMainnet = 42161,
    ArbitrumGoerli = 421613,
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

export const addresses = require(`.${Network[network].replace(/([A-Z])/g, "/$1").toLowerCase()}.ts`)
    .default as Addresses
