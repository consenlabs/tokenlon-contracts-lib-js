const network = process.env.NETWORK

export default require(`./${network}.ts`).default as {
    // Token
    WETH: string
    DAI: string

    // Tokenlon
    Tokenlon: string
    AllowanceTarget: string
    AMMWrapperWithPath: string

    // Uniswap
    UniswapV3Quoter: string
    UniswapV3Router: string
}
