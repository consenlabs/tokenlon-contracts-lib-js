import { expect } from "chai"
import { ContractReceipt } from "ethers"
import { ethers } from "hardhat"

import { Network, isNetwork } from "@network"
import { AMMOrder, SignatureType, encodingHelper, signingHelper } from "@src/v5"
import { UniswapV3Fee } from "@src/uniswap"

import { dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import {
    deployERC1271Wallet,
    deployERC1271WalletETHSign,
    parseLogsByName,
} from "@test/utils/contract"

if (isNetwork(Network.Mainnet)) {
    contextSuite("AMMWrapperWithPath", ({ wallet, network, token, tokenlon, uniswap }) => {
        const defaultOrder: AMMOrder = {
            // Should fill following fields in each case
            makerAddr: "0x",
            // Could override following fields at need in each case
            takerAssetAddr: token.WETH.address,
            makerAssetAddr: token.DAI.address,
            takerAssetAmount: 100,
            makerAssetAmount: 100 * 1000,
            userAddr: wallet.user.address,
            receiverAddr: wallet.user.address,
            salt: signingHelper.generateRandomSalt(),
            deadline: EXPIRY,
        }

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
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                order.takerAssetAddr,
                order.takerAssetAmount,
            )
            const signature = await signingHelper.signAMMOrder(order, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.AMMWrapperWithPath.address,
            })
            const payload = encodingHelper.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData: "0x",
                path,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwapped(receipt, order)
        })

        it("Should sign and encode valid Uniswap v2 order for ERC1271 wallet", async () => {
            const erc1271Wallet = await deployERC1271Wallet(wallet.user)
            const order = {
                ...defaultOrder,
                makerAddr: uniswap.UniswapV2Router.address,
                userAddr: erc1271Wallet.address,
                receiverAddr: erc1271Wallet.address,
            }
            const path = [order.takerAssetAddr, order.makerAssetAddr]
            ;[, order.makerAssetAmount] = await uniswap.UniswapV2Router.callStatic.getAmountsOut(
                order.takerAssetAmount,
                path,
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
            const signature = await signingHelper.signAMMOrder(order, {
                type: SignatureType.WalletBytes32,
                signer: wallet.user,
                verifyingContract: tokenlon.AMMWrapperWithPath.address,
            })
            const payload = encodingHelper.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData: "0x",
                path,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwapped(receipt, order)
        })

        it("Should sign and encode valid Uniswap v2 order for ERC1271 wallet by ETHSign", async () => {
            const erc1271Wallet = await deployERC1271WalletETHSign(wallet.user)
            const order = {
                ...defaultOrder,
                makerAddr: uniswap.UniswapV2Router.address,
                userAddr: erc1271Wallet.address,
                receiverAddr: erc1271Wallet.address,
            }
            const path = [order.takerAssetAddr, order.makerAssetAddr]
            ;[, order.makerAssetAmount] = await uniswap.UniswapV2Router.callStatic.getAmountsOut(
                order.takerAssetAmount,
                path,
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
            const digest = await signingHelper.getAMMOrderEIP712Digest(order, {
                chainId: network.chainId,
                verifyingContract: tokenlon.AMMWrapperWithPath.address,
            })
            const digestSigned = await wallet.user.signMessage(ethers.utils.arrayify(digest))
            const signature = signingHelper.composeSignature(
                digestSigned,
                SignatureType.WalletBytes32,
            )
            const payload = encodingHelper.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData: "0x",
                path,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwapped(receipt, order)
        })

        it("Should sign and encode valid Uniswap v3 single hop order", async () => {
            const order = {
                ...defaultOrder,
                makerAddr: uniswap.UniswapV3Router.address,
            }
            const path = [order.takerAssetAddr, order.makerAssetAddr]
            order.makerAssetAmount = await uniswap.UniswapV3Quoter.callStatic.quoteExactInputSingle(
                order.takerAssetAddr,
                order.makerAssetAddr,
                UniswapV3Fee.LOW,
                order.takerAssetAmount,
                0,
            )
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                order.takerAssetAddr,
                order.takerAssetAmount,
            )
            const signature = await signingHelper.signAMMOrder(order, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.AMMWrapperWithPath.address,
            })
            const makerSpecificData = encodingHelper.encodeAMMUniswapV3SingleHopData(
                UniswapV3Fee.LOW,
            )
            const payload = encodingHelper.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData,
                path,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwapped(receipt, order)
        })

        it("Should sign and encode valid Uniswap v3 multi hops order", async () => {
            const order = {
                ...defaultOrder,
                makerAddr: uniswap.UniswapV3Router.address,
            }
            const path = [order.takerAssetAddr, order.makerAssetAddr]
            const fees = [UniswapV3Fee.LOW]
            order.makerAssetAmount = await uniswap.UniswapV3Quoter.callStatic.quoteExactInput(
                encodingHelper.encodeUniswapV3Path(path, fees),
                order.takerAssetAmount,
            )
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                order.takerAssetAddr,
                order.takerAssetAmount,
            )
            const signature = await signingHelper.signAMMOrder(order, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.AMMWrapperWithPath.address,
            })
            const makerSpecificData = encodingHelper.encodeAMMUniswapV3MultiHopsData(path, fees)
            const payload = encodingHelper.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData,
                path,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwapped(receipt, order)
        })

        it("Should sign and encode valid Curve v1 order", async () => {
            const curve3pool = await ethers.getContractAt("ICurve", network.addresses.Curve3Pool)
            const order = {
                ...defaultOrder,
                makerAddr: curve3pool.address,
                takerAssetAddr: token.USDC.address,
                makerAssetAddr: token.USDT.address,
                takerAssetAmount: 100,
            }
            const path = [order.takerAssetAddr, order.makerAssetAddr]
            // In 3 pool, USDC has index of 1, and USDT has index of 2.
            order.makerAssetAmount = await curve3pool.callStatic.get_dy(
                1,
                2,
                order.takerAssetAmount,
            )
            await dealTokenAndApprove(
                wallet.user,
                tokenlon.AllowanceTarget,
                order.takerAssetAddr,
                order.takerAssetAmount,
            )
            const signature = await signingHelper.signAMMOrder(order, {
                type: SignatureType.EIP712,
                signer: wallet.user,
                verifyingContract: tokenlon.AMMWrapperWithPath.address,
            })
            const makerSpecificData = encodingHelper.encodeAMMCurveData(1)
            const payload = encodingHelper.encodeAMMTradeWithPath({
                ...order,
                feeFactor: 0,
                signature,
                makerSpecificData,
                path,
            })
            const tx = await tokenlon.UserProxy.connect(wallet.user).toAMM(payload)
            const receipt = await tx.wait()

            assertSwapped(receipt, order)
        })

        function assertSwapped(receipt: ContractReceipt, order: AMMOrder) {
            const [
                {
                    args: [, orderLog],
                },
            ] = parseLogsByName(tokenlon.AMMWrapperWithPath, "Swapped", receipt.logs)

            // Verify order
            expect(orderLog.makerAddr).to.equal(order.makerAddr)
            expect(orderLog.takerAssetAddr).to.equal(order.takerAssetAddr)
            expect(orderLog.makerAssetAddr).to.equal(order.makerAssetAddr)
            expect(orderLog.takerAssetAmount).to.equal(order.takerAssetAmount)
            expect(orderLog.makerAssetAmount).to.equal(order.makerAssetAmount)
            expect(orderLog.userAddr).to.equal(order.userAddr)
            expect(orderLog.receiverAddr).to.equal(order.receiverAddr)
            expect(orderLog.salt).to.equal(order.salt)
            expect(orderLog.deadline).to.equal(order.deadline)
        }
    })
}
