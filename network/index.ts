const network = process.env.NETWORK

export default require(`./${network}.ts`).default as {
    // Token
    WETH: string
    DAI: string

    // Tokenlon
    AllowanceTarget: string
    AMMWrapperWithPath: string
    UserProxy: string

    // Uniswap
    UniswapV3Quoter: string
    UniswapV3Router: string
}
