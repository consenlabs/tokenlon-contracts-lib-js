import { expect } from "chai"
import { ContractReceipt, Wallet } from "ethers"
import { ethers, network } from "hardhat"

import { Network, isNetwork } from "@network"
import {
    LimitOrder,
    LimitOrderAllowFill,
    LimitOrderFill,
    LimitOrderProtocol,
    LimitOrderProtocolData,
    encoder,
    signer,
} from "@src/v5"
import { SignatureType } from "@src/signer"
import { UniswapV3Fee } from "@src/uniswap"

import { dealETH, dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import { deployERC1271Wallet, parseLogsByName } from "@test/utils/contract"

if (isNetwork(Network.Arbitrum)) {
    contextSuite("LimitOrder", ({ wallet, token, tokenlon, uniswap, sushiswap }) => {
        const coordinator = Wallet.createRandom().connect(ethers.provider)
        const maker = Wallet.createRandom().connect(ethers.provider)
        const defaultOrder: LimitOrder = {
            // Could override following fields at need in each case
            makerToken: token.WETH.address,
            takerToken: token.DAI.address,
            makerTokenAmount: 100,
            takerTokenAmount: 100 * 1000,
            maker: maker.address,
            taker: ethers.constants.AddressZero, // can be filled by anyone
            salt: signer.generateRandomSalt(),
            expiry: EXPIRY,
        }

        before(async () => {
            // Setup wallets' balance for gas
            await dealETH(maker, ethers.utils.parseEther("100"))

            // Replace coordinator on chain
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

                await dealTokenAndApprove(
                    maker,
                    tokenlon.AllowanceTarget,
                    order.makerToken,
                    order.makerTokenAmount,
                )
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    order.takerToken,
                    order.takerTokenAmount,
                )

                // maker
                const orderHash = await signer.getLimitOrderEIP712Digest(order, {
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })
                const makerSignature = await signer.signLimitOrder(order, {
                    type: SignatureType.EIP712,
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // taker
                const fill: LimitOrderFill = {
                    orderHash,
                    taker: wallet.user.address,
                    recipient: wallet.user.address,
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

            it("Should sign and encode valid order for ERC1271 wallet", async () => {
                const makerERC1271Wallet = await deployERC1271Wallet(maker)

                const order = {
                    ...defaultOrder,
                    maker: makerERC1271Wallet.address,
                }

                await dealTokenAndApprove(
                    maker,
                    tokenlon.AllowanceTarget,
                    order.makerToken,
                    order.makerTokenAmount,
                    {
                        walletContract: makerERC1271Wallet,
                    },
                )
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    order.takerToken,
                    order.takerTokenAmount,
                )

                // maker
                const orderHash = await signer.getLimitOrderEIP712Digest(order, {
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })
                const makerSignature = await signer.signLimitOrder(order, {
                    type: SignatureType.WalletBytes32,
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // taker
                const fill: LimitOrderFill = {
                    orderHash,
                    taker: wallet.user.address,
                    recipient: wallet.user.address,
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
                expect(args.taker).to.equal(fill.taker)
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

        describe("fillLimitOrderByProtocol", () => {
            it("Should sign and encode valid Sushiswap order", async () => {
                const order = {
                    ...defaultOrder,
                }
                const path = [order.makerToken, order.takerToken]
                ;[, order.takerTokenAmount] =
                    await sushiswap.SushiswapRouter.callStatic.getAmountsOut(
                        order.makerTokenAmount,
                        path,
                    )

                await dealTokenAndApprove(
                    maker,
                    tokenlon.AllowanceTarget,
                    order.makerToken,
                    order.makerTokenAmount,
                )

                // maker
                const orderHash = await signer.getLimitOrderEIP712Digest(order, {
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })
                const makerSignature = await signer.signLimitOrder(order, {
                    type: SignatureType.EIP712,
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // protocol
                const sushiswapPath = encoder.encodePath(path)
                const protocol: LimitOrderProtocolData = {
                    protocol: LimitOrderProtocol.Sushiswap,
                    data: sushiswapPath,
                    profitRecipient: wallet.user.address,
                    takerTokenAmount: order.takerTokenAmount,
                    protocolOutMinimum: order.takerTokenAmount,
                    expiry: EXPIRY,
                }

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

                const payload = encoder.encodeLimitOrderFillByProtocol({
                    order,
                    makerSignature,
                    protocol,
                    allowFill,
                    coordinatorSignature,
                })
                const tx = await tokenlon.UserProxy.connect(wallet.user).toLimitOrder(payload)
                const receipt = await tx.wait()

                await assertFilledByProtocol(receipt, order, protocol, allowFill)
            })

            it("Should sign and encode valid Uniswap v3 order", async () => {
                const order = {
                    ...defaultOrder,
                }
                const uniswapV3Path = encoder.encodeUniswapV3Path(
                    [order.makerToken, order.takerToken],
                    [UniswapV3Fee.LOW],
                )
                order.takerTokenAmount = await uniswap.UniswapV3Quoter.callStatic.quoteExactInput(
                    uniswapV3Path,
                    order.makerTokenAmount,
                )

                await dealTokenAndApprove(
                    maker,
                    tokenlon.AllowanceTarget,
                    order.makerToken,
                    order.makerTokenAmount,
                )

                // maker
                const orderHash = await signer.getLimitOrderEIP712Digest(order, {
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })
                const makerSignature = await signer.signLimitOrder(order, {
                    type: SignatureType.EIP712,
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // protocol
                const protocol: LimitOrderProtocolData = {
                    protocol: LimitOrderProtocol.UniswapV3,
                    data: uniswapV3Path,
                    profitRecipient: wallet.user.address,
                    takerTokenAmount: order.takerTokenAmount,
                    protocolOutMinimum: order.takerTokenAmount,
                    expiry: EXPIRY,
                }

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

                const payload = encoder.encodeLimitOrderFillByProtocol({
                    order,
                    makerSignature,
                    protocol,
                    allowFill,
                    coordinatorSignature,
                })
                const tx = await tokenlon.UserProxy.connect(wallet.user).toLimitOrder(payload)
                const receipt = await tx.wait()

                await assertFilledByProtocol(receipt, order, protocol, allowFill)
            })

            it("Should sign and encode valid Uniswap v3 order for ERC1271 wallet", async () => {
                const makerERC1271Wallet = await deployERC1271Wallet(maker)

                const order = {
                    ...defaultOrder,
                    maker: makerERC1271Wallet.address,
                }
                const uniswapV3Path = encoder.encodeUniswapV3Path(
                    [order.makerToken, order.takerToken],
                    [UniswapV3Fee.LOW],
                )
                order.takerTokenAmount = await uniswap.UniswapV3Quoter.callStatic.quoteExactInput(
                    uniswapV3Path,
                    order.makerTokenAmount,
                )

                await dealTokenAndApprove(
                    maker,
                    tokenlon.AllowanceTarget,
                    order.makerToken,
                    order.makerTokenAmount,
                    {
                        walletContract: makerERC1271Wallet,
                    },
                )

                // maker
                const orderHash = await signer.getLimitOrderEIP712Digest(order, {
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })
                const makerSignature = await signer.signLimitOrder(order, {
                    type: SignatureType.WalletBytes32,
                    signer: maker,
                    verifyingContract: tokenlon.LimitOrder.address,
                })

                // protocol
                const protocol: LimitOrderProtocolData = {
                    protocol: LimitOrderProtocol.UniswapV3,
                    data: uniswapV3Path,
                    profitRecipient: wallet.user.address,
                    takerTokenAmount: order.takerTokenAmount,
                    protocolOutMinimum: order.takerTokenAmount,
                    expiry: EXPIRY,
                }

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

                const payload = encoder.encodeLimitOrderFillByProtocol({
                    order,
                    makerSignature,
                    protocol,
                    allowFill,
                    coordinatorSignature,
                })
                const tx = await tokenlon.UserProxy.connect(wallet.user).toLimitOrder(payload)
                const receipt = await tx.wait()

                await assertFilledByProtocol(receipt, order, protocol, allowFill)
            })

            async function assertFilledByProtocol(
                receipt: ContractReceipt,
                order: LimitOrder,
                protocol: LimitOrderProtocolData,
                allowFill: LimitOrderAllowFill,
            ) {
                const [{ args }] = parseLogsByName(
                    tokenlon.LimitOrder,
                    "LimitOrderFilledByProtocol",
                    receipt.logs,
                )
                expect(args.orderHash).to.equal(
                    await signer.getLimitOrderEIP712Digest(order, {
                        signer: maker,
                        verifyingContract: tokenlon.LimitOrder.address,
                    }),
                )
                expect(args.maker).to.equal(order.maker)
                expect(args.taker).to.equal(getProtocolAddress(protocol.protocol))
                expect(args.allowFillHash).to.equal(
                    await signer.getLimitOrderAllowFillEIP712Digest(allowFill, {
                        signer: coordinator,
                        verifyingContract: tokenlon.LimitOrder.address,
                    }),
                )
                expect(args.relayer).to.equal(allowFill.executor)
                expect(args.profitRecipient).to.equal(protocol.profitRecipient)

                const fillReceipt = args.fillReceipt
                expect(fillReceipt.makerToken).to.equal(order.makerToken)
                expect(fillReceipt.takerToken).to.equal(order.takerToken)
                expect(fillReceipt.makerTokenFilledAmount).to.equal(order.makerTokenAmount)
                expect(fillReceipt.takerTokenFilledAmount).to.equal(order.takerTokenAmount)
                expect(fillReceipt.remainingAmount).to.equal(0)
            }

            function getProtocolAddress(protocol: LimitOrderProtocol): string {
                switch (protocol) {
                    case LimitOrderProtocol.UniswapV3:
                        return uniswap.UniswapV3Router.address
                    case LimitOrderProtocol.Sushiswap:
                        return sushiswap.SushiswapRouter.address
                    default:
                        throw new Error(`Unknown protocol ${protocol}`)
                }
            }
        })
    })
}
