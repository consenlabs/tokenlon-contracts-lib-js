const network = process.env.NETWORK

export type Network = {
    // Token
    DAI: string
    WETH: string

    // Tokenlon
    AllowanceTarget: string
    AMMWrapperWithPath: string
    UserProxy: string

    // Uniswap
    UniswapV2Router: string
    UniswapV3Quoter: string
    UniswapV3Router: string
}

export default require(`./${network}.ts`).default as Network
