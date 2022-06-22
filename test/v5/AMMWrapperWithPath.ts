import { expect } from "chai"
import { ContractReceipt } from "ethers"
import { ethers } from "hardhat"

import { AMMOrder, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"
import { UniswapV3Fee, encodeUniswapV3Path } from "@src/uniswap"

import { dealToken } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import { parseLogsByName } from "@test/utils/contract"

contextSuite("AMMWrapperWithPath", ({ wallet, token, tokenlon, uniswap, network }) => {
    const defaultOrder: AMMOrder = {
        makerAddr: "0x",
        takerAssetAddr: token.WETH.address,
        makerAssetAddr: token.DAI.address,
        takerAssetAmount: 100,
        makerAssetAmount: 0,
        userAddr: wallet.user.address,
        receiverAddr: wallet.user.address,
        salt: signer.randomSalt(),
        deadline: EXPIRY,
    }

    before(async () => {
        await token.WETH.connect(wallet.user).approve(
            tokenlon.AllowanceTarget.address,
            defaultOrder.takerAssetAmount,
        )
        await dealToken(wallet.user, token.WETH, defaultOrder.takerAssetAmount)
    })

    it("Should sign and encode valid Uniswap v2 order", async () => {
        const order = {
            ...defaultOrder,
            makerAddr: uniswap.UniswapV2Router.address,
        }
        const path = [order.takerAssetAddr, order.makerAssetAddr]
        ;[, order.makerAssetAmount] = await uniswap.UniswapV2Router.callStatic.getAmountsOut(
            order.takerAssetAmount,
            path,
        )
        const { signature } = await signer.connect(wallet.user).signAMMOrder(order, {
            type: SignatureType.EIP712,
            verifyingContract: tokenlon.AMMWrapperWithPath.address,
        })
        const payload = encoder.encodeAMMTradeWithPath({
            ...order,
            feeFactor: 0,
            signature,
            makerSpecificData: "0x",
            path,
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
        const receipt = await tx.wait()

        assertSwappedByUniswapV2(receipt, order)
    })

    it("Should sign and encode valid Uniswap v3 single hop order", async () => {
        const order = {
            ...defaultOrder,
            makerAddr: uniswap.UniswapV3Router.address,
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
        const makerSpecificData = encoder.encodeAMMUniswapV3SingleHopData(UniswapV3Fee.LOW)
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

    it("Should sign and encode valid Uniswap v3 multi hops order", async () => {
        const order = {
            ...defaultOrder,
            makerAddr: uniswap.UniswapV3Router.address,
        }
        const path = [order.takerAssetAddr, order.makerAssetAddr]
        const fees = [UniswapV3Fee.LOW]
        order.makerAssetAmount = await uniswap.UniswapV3Quoter.callStatic.quoteExactInput(
            encodeUniswapV3Path(path, fees),
            order.takerAssetAmount,
        )
        const { signature } = await signer.connect(wallet.user).signAMMOrder(order, {
            type: SignatureType.EIP712,
            verifyingContract: tokenlon.AMMWrapperWithPath.address,
        })
        const makerSpecificData = encoder.encodeAMMUniswapV3MultiHopsData(path, fees)
        const payload = encoder.encodeAMMTradeWithPath({
            ...order,
            feeFactor: 0,
            signature,
            makerSpecificData,
            path,
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
        const receipt = await tx.wait()

        assertSwappedByUniswapV3(receipt, order)
    })

    it("Should sign and encode valid Curve v1 order", async () => {
        const curve3pool = await ethers.getContractAt("ICurve", network.Curve3Pool)
        const order = {
            ...defaultOrder,
            makerAddr: curve3pool.address,
            takerAssetAddr: token.USDC.address,
            takerAssetAmount: 100,
            makerAssetAddr: token.USDT.address,
        }
        // In 3 pool, USDC has index of 1, and USDT has index of 2.
        order.makerAssetAmount = await curve3pool.callStatic.get_dy(1, 2, order.takerAssetAmount)

        await token.USDC.connect(wallet.user).approve(
            tokenlon.AllowanceTarget.address,
            order.takerAssetAmount,
        )
        await dealToken(wallet.user, token.USDC, order.takerAssetAmount)

        const { signature } = await signer.connect(wallet.user).signAMMOrder(order, {
            type: SignatureType.EIP712,
            verifyingContract: tokenlon.AMMWrapperWithPath.address,
        })
        const makerSpecificData = encoder.encodeAMMCurveData(1)
        const payload = encoder.encodeAMMTradeWithPath({
            ...order,
            feeFactor: 0,
            signature,
            makerSpecificData,
            path: [order.takerAssetAddr, order.makerAssetAddr],
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
        const receipt = await tx.wait()

        assertSwappedByCurve(receipt, order)
    })

    function assertSwappedByUniswapV2(receipt: ContractReceipt, order: AMMOrder) {
        assertSwapped(receipt, "Uniswap V2", order)
    }

    function assertSwappedByUniswapV3(receipt: ContractReceipt, order: AMMOrder) {
        assertSwapped(receipt, "Uniswap V3", order)
    }

    function assertSwappedByCurve(receipt: ContractReceipt, order: AMMOrder) {
        assertSwapped(receipt, "Curve", order)
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
