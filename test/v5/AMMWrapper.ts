import { expect } from "chai"
import { ContractReceipt } from "ethers"

import { AMMOrder, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"

import { dealToken } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import { parseLogsByName } from "@test/utils/contract"

contextSuite("AMMWrapper", ({ wallet, token, tokenlon, uniswap }) => {
    const defaultOrder: AMMOrder = {
        // Should fill out following fields by case
        makerAddr: "0x",
        takerAssetAddr: "0x",
        makerAssetAddr: "0x",
        takerAssetAmount: 0,
        makerAssetAmount: 0,
        // Could override following fields at need
        userAddr: wallet.user.address,
        receiverAddr: wallet.user.address,
        salt: signer.generateRandomSalt(),
        deadline: EXPIRY,
    }

    it("Should sign and encode valid order", async () => {
        const order = {
            ...defaultOrder,
            makerAddr: uniswap.UniswapV2Router.address,
            takerAssetAddr: token.WETH.address,
            makerAssetAddr: token.DAI.address,
            takerAssetAmount: 100,
        }
        order.makerAssetAmount = (
            await uniswap.UniswapV2Router.getAmountsOut(order.takerAssetAmount, [
                order.takerAssetAddr,
                order.makerAssetAddr,
            ])
        )[1]
        await token.WETH.connect(wallet.user).approve(
            tokenlon.AllowanceTarget.address,
            order.takerAssetAmount,
        )
        await dealToken(wallet.user, token.WETH, order.takerAssetAmount)

        const signature = await signer.connect(wallet.user).signAMMOrder(order, {
            type: SignatureType.EIP712,
            verifyingContract: tokenlon.AMMWrapper.address,
        })
        const payload = encoder.encodeAMMTrade({
            ...order,
            feeFactor: 0,
            signature,
        })
        const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
        const receipt = await tx.wait()

        assertSwapped(receipt, order)
    })

    function assertSwapped(receipt: ContractReceipt, order: AMMOrder) {
        const { args } = parseLogsByName(tokenlon.AMMWrapper, "Swapped", receipt.logs)[0]

        // Verify order
        expect(args.transactionHash).to.equal(signer.getAMMOrderEIP712StructHash(order))
        expect(args.makerAddr).to.equal(order.makerAddr)
        expect(args.takerAssetAddr).to.equal(order.takerAssetAddr)
        expect(args.makerAssetAddr).to.equal(order.makerAssetAddr)
        expect(args.takerAssetAmount).to.equal(order.takerAssetAmount)
        expect(args.makerAssetAmount).to.equal(order.makerAssetAmount)
        expect(args.userAddr).to.equal(order.userAddr)
        expect(args.receiverAddr).to.equal(order.receiverAddr)
    }
})
