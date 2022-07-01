import { expect } from "chai"
import { ContractReceipt, Wallet } from "ethers"
import { ethers } from "hardhat"

import { RFQTakerOrder, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"

import { dealETH, dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import {
    deployERC1271Wallet,
    deployERC1271WalletETHSign,
    parseLogsByName,
} from "@test/utils/contract"

contextSuite("RFQ", ({ wallet, token, tokenlon }) => {
    const maker = Wallet.createRandom().connect(ethers.provider)
    const defaultOrder = {
        // Could override following fields at need
        takerAddr: wallet.user.address,
        makerAddr: maker.address,
        takerAssetAddr: token.WETH.address,
        makerAssetAddr: token.DAI.address,
        takerAssetAmount: 1,
        makerAssetAmount: 1000,
        receiverAddr: wallet.user.address,
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
            token.DAI,
            order.makerAssetAmount,
        )
        const makerSignature = await signer.signRFQMakerOrder(order, {
            type: SignatureType.EIP712,
            signer: maker,
            verifyingContract: tokenlon.RFQ.address,
        })
        const takerSignature = await signer.signRFQTakerOrder(order, {
            type: SignatureType.EIP712,
            signer: wallet.user,
            verifyingContract: tokenlon.RFQ.address,
        })
        const payload = encoder.encodeRFQFill({
            ...order,
            makerSignature,
            takerSignature,
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toRFQ(payload, {
            value: order.takerAssetAmount,
        })
        const receipt = await tx.wait()

        assertFilled(receipt, order)
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
            token.DAI,
            order.makerAssetAmount,
            {
                walletContract: makerERC1271Wallet,
            },
        )
        const makerSignature = await signer.signRFQMakerOrder(order, {
            type: SignatureType.WalletBytes32,
            signer: maker,
            verifyingContract: tokenlon.RFQ.address,
        })
        const takerSignature = await signer.signRFQTakerOrder(order, {
            type: SignatureType.EIP712,
            signer: wallet.user,
            verifyingContract: tokenlon.RFQ.address,
        })
        const payload = encoder.encodeRFQFill({
            ...order,
            makerSignature,
            takerSignature,
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toRFQ(payload, {
            value: order.takerAssetAmount,
        })
        const receipt = await tx.wait()

        assertFilled(receipt, order)
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
            token.DAI,
            order.makerAssetAmount,
            {
                walletContract: makerERC1271Wallet,
            },
        )
        const makerOrderDigest = await signer.getRFQMakerOrderEIP712Digest(order, {
            signer: maker,
            verifyingContract: tokenlon.RFQ.address,
        })
        const makerSignature = signer.composeSignature(
            await maker.signMessage(ethers.utils.arrayify(makerOrderDigest)),
            SignatureType.WalletBytes32,
        )
        const takerSignature = await signer.signRFQTakerOrder(order, {
            type: SignatureType.EIP712,
            signer: wallet.user,
            verifyingContract: tokenlon.RFQ.address,
        })
        const payload = encoder.encodeRFQFill({
            ...order,
            makerSignature,
            takerSignature,
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toRFQ(payload, {
            value: order.takerAssetAmount,
        })
        const receipt = await tx.wait()

        assertFilled(receipt, order)
    })

    async function assertFilled(receipt: ContractReceipt, order: RFQTakerOrder) {
        const [{ args }] = parseLogsByName(tokenlon.RFQ, "FillOrder", receipt.logs)

        // Verify order
        expect(args.source).to.equal("RFQ v1")
        expect(args.orderHash).to.equal(signer.getRFQMakerOrderEIP712StructHash(order))
        expect(args.transactionHash).to.equal(signer.getRFQTakerOrderEIP712StructHash(order))
        expect(args.makerAddr).to.equal(order.makerAddr)
        expect(args.takerAssetAddr).to.equal(order.takerAssetAddr)
        expect(args.makerAssetAddr).to.equal(order.makerAssetAddr)
        expect(args.takerAssetAmount).to.equal(order.takerAssetAmount)
        expect(args.makerAssetAmount).to.equal(order.makerAssetAmount)
        expect(args.userAddr).to.equal(order.takerAddr)
        expect(args.receiverAddr).to.equal(order.receiverAddr)
        expect(args.feeFactor).to.equal(order.feeFactor)
    }
})
