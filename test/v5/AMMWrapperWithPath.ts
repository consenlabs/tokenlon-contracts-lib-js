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

        assertSwappedByUniswapV3(receipt)
    })

    function assertSwappedByUniswapV3(receipt: ContractReceipt) {
        assertSwapped(receipt, "Uniswap V3")
    }

    function assertSwapped(receipt: ContractReceipt, source: string) {
        const { args } = parseLogsByName(tokenlon.AMMWrapperWithPath, "Swapped", receipt.logs)[0]
        expect(args[0].source).to.equal(source)
    }
})
