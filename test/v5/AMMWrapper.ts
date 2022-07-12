import { expect } from "chai"
import { ContractReceipt } from "ethers"

import { Network, isNetwork } from "@network"
import { AMMOrder, encoder, signer } from "@src/v5"
import { SignatureType } from "@src/signer"

import { dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import { deployERC1271Wallet, parseLogsByName } from "@test/utils/contract"

if (isNetwork(Network.Mainnet)) {
    contextSuite("AMMWrapper", ({ wallet, token, tokenlon, uniswap }) => {
        const defaultOrder: AMMOrder = {
            // Should fill following fields in each case
            makerAddr: "0x",
            takerAssetAddr: "0x",
            makerAssetAddr: "0x",
            takerAssetAmount: 0,
            makerAssetAmount: 0,
            // Could override following fields at need in each case
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
            ;[, order.makerAssetAmount] = await uniswap.UniswapV2Router.getAmountsOut(
                order.takerAssetAmount,
                [order.takerAssetAddr, order.makerAssetAddr],
            )
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                order.takerAssetAddr,
                order.takerAssetAmount,
            )
            const signature = await signer.signAMMOrder(order, {
                type: SignatureType.EIP712,
                signer: wallet.user,
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

        it("Should sign and encode valid order for ERC1271 wallet", async () => {
            const erc1271Wallet = await deployERC1271Wallet(wallet.user)
            const order = {
                ...defaultOrder,
                makerAddr: uniswap.UniswapV2Router.address,
                takerAssetAddr: token.WETH.address,
                makerAssetAddr: token.DAI.address,
                takerAssetAmount: 100,
                userAddr: erc1271Wallet.address,
                receiverAddr: erc1271Wallet.address,
            }
            ;[, order.makerAssetAmount] = await uniswap.UniswapV2Router.getAmountsOut(
                order.takerAssetAmount,
                [order.takerAssetAddr, order.makerAssetAddr],
            )
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                order.takerAssetAddr,
                order.takerAssetAmount,
                {
                    walletContract: erc1271Wallet,
                },
            )
            const signature = await signer.signAMMOrder(order, {
                type: SignatureType.WalletBytes32,
                signer: wallet.user,
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
            const [{ args }] = parseLogsByName(tokenlon.AMMWrapper, "Swapped", receipt.logs)

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
}
