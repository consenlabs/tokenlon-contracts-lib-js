import { expect } from "chai"
import { ContractReceipt, Wallet } from "ethers"
import { ethers, network } from "hardhat"

import { Network, isNetwork } from "@network"
import { LimitOrder, LimitOrderFill, LimitOrderAllowFill, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"

import { dealETH, dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import { parseLogsByName } from "@test/utils/contract"

if (isNetwork(Network.Arbitrum)) {
    contextSuite("LimitOrder", ({ token, tokenlon, wallet }) => {
        const coordinator = Wallet.createRandom().connect(ethers.provider)
        const maker = Wallet.createRandom().connect(ethers.provider)
        const defaultOrder = {
            // Could override following fields at need in each case
            makerToken: token.WETH.address,
            takerToken: token.DAI.address,
            makerTokenAmount: 1,
            takerTokenAmount: 1000,
            maker: maker.address,
            taker: wallet.user.address,
            salt: signer.generateRandomSalt(),
            expiry: EXPIRY,
        }

        before(async () => {
            // Setup wallets' balance
            await dealETH(coordinator, ethers.utils.parseEther("100"))
            await dealETH(maker, ethers.utils.parseEther("100"))
            await dealTokenAndApprove(
                maker,
                tokenlon.AllowanceTarget,
                token.WETH,
                defaultOrder.makerTokenAmount,
            )
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                token.DAI,
                defaultOrder.takerTokenAmount,
            )

            // Replace coordinator
            const operator = await ethers.getSigner(await tokenlon.LimitOrder.operator())

            await dealETH(operator, ethers.utils.parseEther("100"))

            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [await operator.getAddress()],
            })
            await tokenlon.LimitOrder.connect(operator).upgradeCoordinator(coordinator.address)

            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [await operator.getAddress()],
            })
        })

        describe("fillLimitOrderByTrader", () => {
            it("Should sign and encode valid order", async () => {
                const order = {
                    ...defaultOrder,
                }
                const orderHash = await signer.getLimitOrderEIP712Digest(order, {
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // maker
                const makerSignature = await signer.signLimitOrder(order, {
                    type: SignatureType.EIP712,
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // taker
                const fill: LimitOrderFill = {
                    orderHash,
                    taker: order.taker,
                    recipient: order.taker,
                    takerTokenAmount: order.takerTokenAmount,
                    takerSalt: signer.generateRandomSalt(),
                    expiry: EXPIRY,
                }
                const takerSignature = await signer.signLimitOrderFill(fill, {
                    type: SignatureType.EIP712,
                    signer: wallet.user,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // coordinator
                const allowFill: LimitOrderAllowFill = {
                    orderHash,
                    executor: wallet.user.address,
                    fillAmount: order.takerTokenAmount,
                    salt: signer.generateRandomSalt(),
                    expiry: EXPIRY,
                }
                const coordinatorSignature = await signer.signLimitOrderAllowFill(allowFill, {
                    type: SignatureType.EIP712,
                    signer: coordinator,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                const payload = encoder.encodeLimitOrderFillByTrader({
                    order,
                    makerSignature,
                    fill,
                    takerSignature,
                    allowFill,
                    coordinatorSignature,
                })
                const tx = await tokenlon.UserProxy.connect(wallet.user).toLimitOrder(payload)
                const receipt = await tx.wait()

                await assertFilledByTrader(receipt, order, fill, allowFill)
            })

            async function assertFilledByTrader(
                receipt: ContractReceipt,
                order: LimitOrder,
                fill: LimitOrderFill,
                allowFill: LimitOrderAllowFill,
            ) {
                const [{ args }] = parseLogsByName(
                    tokenlon.LimitOrder,
                    "LimitOrderFilledByTrader",
                    receipt.logs,
                )
                expect(args.orderHash).to.equal(
                    await signer.getLimitOrderEIP712Digest(order, {
                        signer: maker,
                        verifyingContract: tokenlon.LimitOrder.address,
                    }),
                )
                expect(args.maker).to.equal(order.maker)
                expect(args.taker).to.equal(order.taker)
                expect(args.allowFillHash).to.equal(
                    await signer.getLimitOrderAllowFillEIP712Digest(allowFill, {
                        signer: coordinator,
                        verifyingContract: tokenlon.LimitOrder.address,
                    }),
                )
                expect(args.recipient).to.equal(fill.recipient)

                const fillReceipt = args.fillReceipt
                expect(fillReceipt.makerToken).to.equal(order.makerToken)
                expect(fillReceipt.takerToken).to.equal(order.takerToken)
                expect(fillReceipt.makerTokenFilledAmount).to.equal(order.makerTokenAmount)
                expect(fillReceipt.takerTokenFilledAmount).to.equal(order.takerTokenAmount)
                expect(fillReceipt.remainingAmount).to.equal(0)
            }
        })
    })
}
