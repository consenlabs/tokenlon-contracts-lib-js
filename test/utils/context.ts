import { Wallet } from "ethers"
import { ethers } from "hardhat"

import network from "@network"
import {
    IAMMWrapperWithPath,
    IERC20,
    ITokenlon,
    IUniswapV3Quoter,
    IUniswapV3Router,
} from "@typechain"

import { dealETH, dealToken } from "./balance"
import { toBytes32 } from "./bytes"
import { Snapshot } from "./snapshot"

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
    snapshot: Snapshot
}

const __ctx__ = new Promise<Context>(async (resolve) =>
    resolve({
        wallet: {
            user: new Wallet(toBytes32(1), ethers.provider),
        },
        token: {
            WETH: await ethers.getContractAt("IERC20", network.WETH),
            DAI: await ethers.getContractAt("IERC20", network.DAI),
        },
        tokenlon: {
            AMMWrapperWithPath: await ethers.getContractAt(
                "IAMMWrapperWithPath",
                network.AMMWrapperWithPath,
            ),
            Tokenlon: await ethers.getContractAt("ITokenlon", network.Tokenlon),
        },
        uniswap: {
            UniswapV3Quoter: await ethers.getContractAt(
                "IUniswapV3Quoter",
                network.UniswapV3Quoter,
            ),
            UniswapV3Router: await ethers.getContractAt(
                "IUniswapV3Router",
                network.UniswapV3Router,
            ),
        },
        snapshot: await Snapshot.take(),
    }),
)

interface ContextSuiteFunction {
    (title: string, suite: (ctx: Context) => void, decorator?: "only" | "skip"): Promise<void>
    only: (title: string, suite: (ctx: Context) => void) => Promise<void>
    skip: (title: string, suite: (ctx: Context) => void) => Promise<void>
}

export const contextSuite = async function (
    title: string,
    suite: (ctx: Context) => void,
    decorator?: "only" | "skip",
) {
    const ctx = await __ctx__

    ;(decorator ? describe[decorator] : describe)(title, () => {
        let snapshot: Snapshot

        before(async () => {
            await ctx.snapshot.reset()
            await Promise.all(
                Object.values(ctx.wallet).map((w) => dealETH(w, ethers.utils.parseEther("100"))),
            )
        })

        suite(ctx)

        before(async () => {
            snapshot = await Snapshot.take()
        })

        beforeEach(async () => {
            await snapshot.reset()
        })
    })
} as ContextSuiteFunction

contextSuite.only = function (title: string, suite: (ctx: Context) => void) {
    return contextSuite(title, suite, "only")
}

contextSuite.skip = function (title: string, suite: (ctx: Context) => void) {
    return contextSuite(title, suite, "skip")
}

__ctx__.then(() => run())
