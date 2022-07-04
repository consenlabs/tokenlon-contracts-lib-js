export enum Network {
    Mainnet = "mainnet",
    Arbitrum = "arbitrum",
}

const network = (() => {
    const network = process.env.NETWORK
    switch (network) {
        case Network.Arbitrum:
            return Network.Arbitrum
        case Network.Mainnet:
            return Network.Mainnet
        default:
            throw new Error(`Unknown network ${network}`)
    }
})()

export function isNetwork(...networks: Network[]): boolean {
    return networks.includes(network)
}

export type Address = {
    // Token
    DAI: string
    USDC: string
    USDT: string
    WETH: string

    // Tokenlon
    AllowanceTarget: string
    AMMWrapper: string
    AMMWrapperWithPath: string
    RFQ: string
    UserProxy: string

    // Uniswap
    UniswapV2Router: string
    UniswapV3Quoter: string
    UniswapV3Router: string

    // Curve
    Curve3Pool: string
}

export const address = require(`./${network}.ts`).default as Address
