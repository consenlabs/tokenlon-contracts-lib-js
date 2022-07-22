import { expect } from "chai"
import { ContractReceipt, Wallet } from "ethers"
import { ethers } from "hardhat"

import { Network, isNetwork } from "@network"
import { RFQFill, RFQOrder, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"

import { dealETH, dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import {
    deployERC1271Wallet,
    deployERC1271WalletETHSign,
    parseLogsByName,
} from "@test/utils/contract"

if (isNetwork(Network.Mainnet)) {
    contextSuite("RFQ", ({ wallet, network, token, tokenlon }) => {
        const maker = Wallet.createRandom().connect(ethers.provider)
        const defaultOrder: RFQOrder = {
            // Could override following fields at need in each case
            takerAddr: wallet.user.address,
            makerAddr: maker.address,
            takerAssetAddr: token.WETH.address,
            makerAssetAddr: token.DAI.address,
            takerAssetAmount: 1,
            makerAssetAmount: 1000,
            salt: signer.generateRandomSalt(),
            deadline: EXPIRY,
            feeFactor: 0,
        }

        before(async () => {
            await dealETH(maker, ethers.utils.parseEther("100"))
        })

        it("Should sign and encode valid order", async () => {
            const order = {
                ...defaultOrder,
            }

            await dealTokenAndApprove(
                maker,
                tokenlon.AllowanceTarget,
                order.makerAssetAddr,
                order.makerAssetAmount,
            )

            // maker
            const makerSignature = await signer.signRFQOrder(order, {
                type: SignatureType.EIP712,
                signer: maker,
                verifyingContract: tokenlon.RFQ.address,
            })

            // taker
            const fill: RFQFill = {
                ...order,
                receiverAddr: wallet.user.address,
            }
            const takerSignature = await signer.signRFQFillOrder(fill, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.RFQ.address,
            })

            const payload = encoder.encodeRFQFill({
                ...fill,
                makerSignature,
                takerSignature,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toRFQ(payload, {
                value: order.takerAssetAmount,
            })
            const receipt = await tx.wait()

            assertFilled(receipt, fill)
        })

        it("Should sign and encode valid order for ERC1271 wallet", async () => {
            const makerERC1271Wallet = await deployERC1271Wallet(maker)

            const order = {
                ...defaultOrder,
                makerAddr: makerERC1271Wallet.address,
            }

            await dealTokenAndApprove(
                maker,
                tokenlon.AllowanceTarget,
                order.makerAssetAddr,
                order.makerAssetAmount,
                {
                    walletContract: makerERC1271Wallet,
                },
            )

            // maker
            const makerSignature = await signer.signRFQOrder(order, {
                type: SignatureType.WalletBytes32,
                signer: maker,
                verifyingContract: tokenlon.RFQ.address,
            })

            // taker
            const fill: RFQFill = {
                ...order,
                receiverAddr: wallet.user.address,
            }
            const takerSignature = await signer.signRFQFillOrder(fill, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.RFQ.address,
            })

            const payload = encoder.encodeRFQFill({
                ...fill,
                makerSignature,
                takerSignature,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toRFQ(payload, {
                value: order.takerAssetAmount,
            })
            const receipt = await tx.wait()

            assertFilled(receipt, fill)
        })

        it("Should sign and encode valid order for ERC1271 wallet by ETHSign", async () => {
            const makerERC1271Wallet = await deployERC1271WalletETHSign(maker)

            const order = {
                ...defaultOrder,
                makerAddr: makerERC1271Wallet.address,
            }

            await dealTokenAndApprove(
                maker,
                tokenlon.AllowanceTarget,
                order.makerAssetAddr,
                order.makerAssetAmount,
                {
                    walletContract: makerERC1271Wallet,
                },
            )

            // maker
            const makerOrderDigest = await signer.getRFQOrderEIP712Digest(order, {
                chainId: network.chainId,
                verifyingContract: tokenlon.RFQ.address,
            })
            const makerSignature = signer.composeSignature(
                await maker.signMessage(ethers.utils.arrayify(makerOrderDigest)),
                SignatureType.WalletBytes32,
            )

            // taker
            const fill: RFQFill = {
                ...order,
                receiverAddr: wallet.user.address,
            }
            const takerSignature = await signer.signRFQFillOrder(fill, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.RFQ.address,
            })

            const payload = encoder.encodeRFQFill({
                ...fill,
                makerSignature,
                takerSignature,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toRFQ(payload, {
                value: order.takerAssetAmount,
            })
            const receipt = await tx.wait()

            assertFilled(receipt, fill)
        })

        async function assertFilled(receipt: ContractReceipt, fill: RFQFill) {
            const [{ args }] = parseLogsByName(tokenlon.RFQ, "FillOrder", receipt.logs)

            // Verify order
            expect(args.source).to.equal("RFQ v1")
            expect(args.orderHash).to.equal(signer.getRFQOrderEIP712StructHash(fill))
            expect(args.transactionHash).to.equal(signer.getRFQFillEIP712StructHash(fill))
            expect(args.makerAddr).to.equal(fill.makerAddr)
            expect(args.takerAssetAddr).to.equal(fill.takerAssetAddr)
            expect(args.makerAssetAddr).to.equal(fill.makerAssetAddr)
            expect(args.takerAssetAmount).to.equal(fill.takerAssetAmount)
            expect(args.makerAssetAmount).to.equal(fill.makerAssetAmount)
            expect(args.userAddr).to.equal(fill.takerAddr)
            expect(args.receiverAddr).to.equal(fill.receiverAddr)
            expect(args.feeFactor).to.equal(fill.feeFactor)
        }
    })
}
