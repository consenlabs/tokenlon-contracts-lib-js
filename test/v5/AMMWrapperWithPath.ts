import { expect } from "chai"
import { ContractReceipt } from "ethers"

import { UniswapV3Fee } from "@src/encoder/utils/uniswap"
import { EncoderV5 } from "@src/encoder/v5"
import { AMMOrder, SignerV5, SignatureType } from "@src/signer/v5"
import { withContext } from "@test/utils/context"
import { EXPIRY } from "@test/utils/constant"
import { parseLogsByName } from "@test/utils/contract"

describe(
    "AMMWrapperWithPath",
    withContext((ctx) => {
        const encoder = new EncoderV5()
        const signer = new SignerV5()

        let order: AMMOrder

        before(async () => {
            order = {
                makerAddr: ctx.uniswap.UniswapV3Router.address,
                takerAssetAddr: ctx.token.WETH.address,
                makerAssetAddr: ctx.token.DAI.address,
                takerAssetAmount: 10,
                makerAssetAmount: 0,
                userAddr: ctx.wallet.user.address,
                receiverAddr: ctx.wallet.user.address,
                salt: signer.randomSalt(),
                deadline: EXPIRY,
            }
            order.makerAssetAmount =
                await ctx.uniswap.UniswapV3Quoter.callStatic.quoteExactInputSingle(
                    order.takerAssetAddr,
                    order.makerAssetAddr,
                    UniswapV3Fee.LOW,
                    order.takerAssetAmount,
                    0,
                )
        })

        it("Should sign valid AMM UniswapV3 single hop order", async () => {
            const { signature } = await signer.connect(ctx.wallet.user).signAMMOrder(order, {
                type: SignatureType.EIP712,
                verifyingContract: ctx.tokenlon.AMMWrapperWithPath.address,
            })
            const payload = encoder.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData: encoder.encodeAMMUniswapV3SingleHop(UniswapV3Fee.LOW),
                path: [ctx.token.WETH.address, ctx.token.DAI.address],
            })
            const tx = await ctx.tokenlon.Tokenlon.connect(ctx.wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwappedByUniswapV3(receipt)
        })

        function assertSwappedByUniswapV3(receipt: ContractReceipt) {
            assertSwapped(receipt, "Uniswap V3")
        }

        function assertSwapped(receipt: ContractReceipt, source: string) {
            const {
                args: [meta],
            } = parseLogsByName(ctx.tokenlon.AMMWrapperWithPath, "Swapped", receipt.logs)[0]
            expect(meta.source).to.equal(source)
        }
    }),
)
