export enum Network {
    Mainnet = 1,
    Goerli = 5,
    Arbitrum = 42161,
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

    // L2 Bridge
    ArbitrumL1GatewayRouter: string
    OptimismL1StandardBridge: string

    // L2 Token
    DAIForArbitrumBridge: string
    USDCForArbitrumBridge: string
    USDTForArbitrumBridge: string
    DAIForOptimismBridge: string
    USDCForOptimismBridge: string
    USDTForOptimismBridge: string
}

export const addresses = require(`./${Network[network].toLowerCase()}.ts`).default as Addresses
