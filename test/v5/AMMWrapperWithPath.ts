import { expect } from "chai"
import { ContractReceipt } from "ethers"
import { ethers } from "hardhat"

import network from "@network"
import { AMMOrder, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"
import { UniswapV3Fee } from "@src/uniswap"

import { dealToken } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import { parseLogsByName } from "@test/utils/contract"

contextSuite("AMMWrapperWithPath", ({ wallet, token, tokenlon, uniswap }) => {
    const defaultOrder: AMMOrder = {
        makerAddr: uniswap.UniswapV3Router.address,
        takerAssetAddr: token.WETH.address,
        makerAssetAddr: token.DAI.address,
        takerAssetAmount: 10,
        makerAssetAmount: 0,
        userAddr: wallet.user.address,
        receiverAddr: wallet.user.address,
        salt: signer.randomSalt(),
        deadline: EXPIRY,
    }

    before(async () => {
        await token.WETH.connect(wallet.user).approve(
            network.AllowanceTarget,
            ethers.constants.MaxUint256,
        )
        await dealToken(wallet.user, token.WETH, defaultOrder.takerAssetAmount)
    })

    it("Should sign valid AMM UniswapV3 single hop order", async () => {
        const order = {
            ...defaultOrder,
        }
        order.makerAssetAmount = await uniswap.UniswapV3Quoter.callStatic.quoteExactInputSingle(
            order.takerAssetAddr,
            order.makerAssetAddr,
            UniswapV3Fee.LOW,
            order.takerAssetAmount,
            0,
        )
        const { signature } = await signer.connect(wallet.user).signAMMOrder(order, {
            type: SignatureType.EIP712,
            verifyingContract: tokenlon.AMMWrapperWithPath.address,
        })
        const makerSpecificData = encoder.encodeAMMUniswapV3SingleHop(UniswapV3Fee.LOW)
        const payload = encoder.encodeAMMTradeWithPath({
            ...order,
            feeFactor: 0,
            signature,
            makerSpecificData,
            path: [order.takerAssetAddr, order.makerAssetAddr],
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
        const receipt = await tx.wait()

        assertSwappedByUniswapV3(receipt, order)
    })

    function assertSwappedByUniswapV3(receipt: ContractReceipt, order: AMMOrder) {
        assertSwapped(receipt, "Uniswap V3", order)
    }

    function assertSwapped(receipt: ContractReceipt, source: string, order: AMMOrder) {
        const {
            args: [txMetaLog, orderLog],
        } = parseLogsByName(tokenlon.AMMWrapperWithPath, "Swapped", receipt.logs)[0]

        // Verify swapped source
        expect(txMetaLog.source).to.equal(source)

        // Verify order
        expect(orderLog.makerAddr).to.equal(order.makerAddr)
        expect(orderLog.takerAssetAddr).to.equal(order.takerAssetAddr)
        expect(orderLog.makerAssetAddr).to.equal(order.makerAssetAddr)
        expect(orderLog.takerAssetAmount.eq(order.takerAssetAmount)).to.be.true
        expect(orderLog.makerAssetAmount.eq(order.makerAssetAmount)).to.be.true
        expect(orderLog.userAddr).to.equal(order.userAddr)
        expect(orderLog.receiverAddr).to.equal(order.receiverAddr)
        expect(orderLog.salt.eq(order.salt)).to.be.true
        expect(orderLog.deadline.eq(order.deadline)).to.be.true
    }
})
