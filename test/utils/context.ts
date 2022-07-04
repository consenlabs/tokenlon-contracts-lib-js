import { Wallet } from "ethers"
import { ethers } from "hardhat"

import { Address, address } from "@network"
import {
    IAllowanceTarget,
    IAMMWrapper,
    IAMMWrapperWithPath,
    IRFQ,
    IUserProxy,
    IERC20,
    IUniswapV2Router,
    IUniswapV3Quoter,
    IUniswapV3Router,
} from "@typechain"

import { dealETH } from "./balance"
import { Snapshot } from "./snapshot"

export type Context = {
    wallet: {
        user: Wallet
    }
    token: {
        DAI: IERC20
        USDC: IERC20
        USDT: IERC20
        WETH: IERC20
    }
    tokenlon: {
        AllowanceTarget: IAllowanceTarget
        AMMWrapper: IAMMWrapper
        AMMWrapperWithPath: IAMMWrapperWithPath
        RFQ: IRFQ
        UserProxy: IUserProxy
    }
    uniswap: {
        UniswapV2Router: IUniswapV2Router
        UniswapV3Quoter: IUniswapV3Quoter
        UniswapV3Router: IUniswapV3Router
    }
    address: Address
    snapshot: Snapshot
}

const __ctx__ = setupContext()

async function setupContext(): Promise<Context> {
    return {
        wallet: {
            user: Wallet.createRandom().connect(ethers.provider),
        },
        token: {
            DAI: await ethers.getContractAt("IERC20", address.DAI),
            USDC: await ethers.getContractAt("IERC20", address.USDC),
            USDT: await ethers.getContractAt("IERC20", address.USDT),
            WETH: await ethers.getContractAt("IERC20", address.WETH),
        },
        tokenlon: {
            AllowanceTarget: await ethers.getContractAt(
                "IAllowanceTarget",
                address.AllowanceTarget,
            ),
            AMMWrapper: await ethers.getContractAt("IAMMWrapper", address.AMMWrapper),
            AMMWrapperWithPath: await ethers.getContractAt(
                "IAMMWrapperWithPath",
                address.AMMWrapperWithPath,
            ),
            RFQ: await ethers.getContractAt("IRFQ", address.RFQ),
            UserProxy: await ethers.getContractAt("IUserProxy", address.UserProxy),
        },
        uniswap: {
            UniswapV2Router: await ethers.getContractAt(
                "IUniswapV2Router",
                address.UniswapV2Router,
            ),
            UniswapV3Quoter: await ethers.getContractAt(
                "IUniswapV3Quoter",
                address.UniswapV3Quoter,
            ),
            UniswapV3Router: await ethers.getContractAt(
                "IUniswapV3Router",
                address.UniswapV3Router,
            ),
        },
        address,
        snapshot: await Snapshot.take(),
    }
}

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

__ctx__.then(() => setTimeout(run, 0))
