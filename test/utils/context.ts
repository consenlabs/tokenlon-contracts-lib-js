import { Wallet } from "ethers"
import { ethers } from "hardhat"

import network from "@network"
import { dealETH, dealToken } from "@test/utils/balance"
import { toBytes32 } from "@test/utils/bytes"
import {
    IAMMWrapperWithPath,
    IERC20,
    ITokenlon,
    IUniswapV3Quoter,
    IUniswapV3Router,
} from "@typechain"

export type Context = {
    wallet: {
        user: Wallet
    }
    token: {
        WETH: IERC20
        DAI: IERC20
    }
    tokenlon: {
        AMMWrapperWithPath: IAMMWrapperWithPath
        Tokenlon: ITokenlon
    }
    uniswap: {
        UniswapV3Quoter: IUniswapV3Quoter
        UniswapV3Router: IUniswapV3Router
    }
}

export function withContext(suite: (ctx: Context) => void) {
    const ctx = {} as Context
    return function () {
        before(async () => {
            ctx.token = {
                WETH: await ethers.getContractAt("IERC20", network.WETH),
                DAI: await ethers.getContractAt("IERC20", network.DAI),
            }
            ctx.tokenlon = {
                AMMWrapperWithPath: await ethers.getContractAt(
                    "IAMMWrapperWithPath",
                    network.AMMWrapperWithPath,
                ),
                Tokenlon: await ethers.getContractAt("ITokenlon", network.Tokenlon),
            }
            ctx.uniswap = {
                UniswapV3Quoter: await ethers.getContractAt(
                    "IUniswapV3Quoter",
                    network.UniswapV3Quoter,
                ),
                UniswapV3Router: await ethers.getContractAt(
                    "IUniswapV3Router",
                    network.UniswapV3Router,
                ),
            }
            ctx.wallet = {
                user: new Wallet(toBytes32(1), ethers.provider),
            }
            await dealETH(ctx.wallet.user, ethers.utils.parseEther("10000"))
            await dealToken(ctx.wallet.user, network.WETH, 100)
            for (const token of Object.values(ctx.token)) {
                await token
                    .connect(ctx.wallet.user)
                    .approve(network.AllowanceTarget, ethers.constants.MaxUint256)
            }
        })

        suite(ctx)
    }
}
