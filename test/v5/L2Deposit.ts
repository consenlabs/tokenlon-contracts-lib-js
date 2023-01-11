import { expect } from "chai"
import { BigNumber, ContractReceipt } from "ethers"
import { ethers } from "hardhat"
import { Network, isNetwork } from "@network"
import {
    L2Deposit,
    L2ArbitrumDepositData,
    L2OptimismDepositData,
    SignatureType,
    encodingHelper,
    signingHelper,
} from "@src/v5"
import { dealTokenAndApprove } from "@test/utils/balance"
import { EXPIRY } from "@test/utils/constant"
import { contextSuite } from "@test/utils/context"
import {
    parseLogsByName,
    deployERC1271Wallet,
    deployERC1271WalletETHSign,
} from "@test/utils/contract"

enum L2Identifier {
    Arbitrum,
    Optimism,
}

if (isNetwork(Network.Goerli)) {
    contextSuite("L2Deposit", ({ wallet, network, token, tokenlon }) => {
        // Configure the default deposit information
        const defaultDeposit: L2Deposit = {
            l2Identifier: 0,
            l1TokenAddr: ethers.constants.AddressZero,
            l2TokenAddr: ethers.constants.AddressZero,
            sender: wallet.user.address,
            recipient: wallet.user.address,
            amount: 100,
            salt: 1234,
            expiry: EXPIRY,
            data: "0x", // It should be a hexadecimal value
        }
        // Declare the gas data for the Arbitrum bridge
        const arbitrumGasData: L2ArbitrumDepositData = {
            maxSubmissionCost: ethers.utils.parseUnits("1", "mwei"),
            maxGas: ethers.utils.parseUnits("1", "mwei"),
            gasPriceBid: ethers.utils.parseUnits("1", "gwei"),
        }
        // Declare the gas data for the Optimism bridge
        const optimismGasData: L2OptimismDepositData = {
            l2Gas: ethers.utils.parseUnits("1", "mwei"),
        }

        /* Test for the Arbitrum bridge  */

        describe("Deposit on the Arbitrum bridge", () => {
            // Test for the EOA
            it(`Should sign and encode a valid deposit for an EOA to use on the Arbitrum bridge.`, async () => {
                const deposit = {
                    // Override the default deposit data for the Arbitrum bridge
                    ...defaultDeposit,
                    l2Identifier: L2Identifier.Arbitrum,
                    l1TokenAddr: token.USDT.address,
                    l2TokenAddr: token.USDTForArbitrumBridge.address,
                    data: encodingHelper.encodeL2ArbitrumDepositData(
                        wallet.user.address,
                        arbitrumGasData,
                    ),
                }
                // Obtain a specific amount of tokens and approve their to be used by the AllowanceTarget contract
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    deposit.l1TokenAddr,
                    deposit.amount,
                )
                // Sign the deposit data using the EOA
                const depositSig = await signingHelper.signL2Deposit(deposit, {
                    type: SignatureType.EIP712,
                    signer: wallet.user,
                    verifyingContract: tokenlon.L2Deposit.address,
                })
                // Encode the deposit and signed data into a byte string with the function signatures hash prefix.
                const payload = encodingHelper.encodeL2Deposit({
                    deposit: deposit,
                    depositSig: depositSig,
                })
                // Send a transaction to the L2Deposit contract through the UserProxy contract
                const tx = await tokenlon.UserProxy.connect(wallet.user).toL2Deposit(payload, {
                    value: calculateArbitrumCallValue(arbitrumGasData),
                })
                // Wait for the block to be mined and the transaction will be completed
                const receipt = await tx.wait()
                // Verify that the event outputs are equal to the deposit data parameters
                assertDepositedEvent(receipt, deposit)
            })

            // Test for the ERC1271 wallet on the Arbitrum bridge
            it(`Should sign and encode a valid deposit for an ERC1271 wallet to use on the Arbitrum bridge.`, async () => {
                // Deploy a new ERC1271 wallet contract as the signer
                const erc1271Wallet = await deployERC1271Wallet(wallet.user)
                const deposit = {
                    // Override the default deposit data for the Arbitrum bridge
                    ...defaultDeposit,
                    l1TokenAddr: token.USDT.address,
                    l2Identifier: L2Identifier.Arbitrum,
                    l2TokenAddr: token.USDTForArbitrumBridge.address,
                    sender: erc1271Wallet.address,
                    recipient: erc1271Wallet.address,
                    data: encodingHelper.encodeL2ArbitrumDepositData(
                        wallet.user.address,
                        arbitrumGasData,
                    ),
                }
                // Obtain a specific amount of tokens and approve their to be used by the AllowanceTarget contract
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    deposit.l1TokenAddr,
                    deposit.amount,
                    {
                        walletContract: erc1271Wallet,
                    },
                )
                // Sign the deposit data using the WalletBytes32
                const depositSig = await signingHelper.signL2Deposit(deposit, {
                    type: SignatureType.WalletBytes32,
                    signer: wallet.user,
                    verifyingContract: tokenlon.L2Deposit.address,
                })
                // Encode the deposit and signed data into a byte string with the function signatures hash prefix.
                const payload = encodingHelper.encodeL2Deposit({
                    deposit: deposit,
                    depositSig: depositSig,
                })
                // Send a transaction to the L2Deposit contract through the UserProxy contract
                const tx = await tokenlon.UserProxy.connect(wallet.user).toL2Deposit(payload, {
                    value: calculateArbitrumCallValue(arbitrumGasData),
                })
                // Wait for the block to be mined and the transaction will be completed
                const receipt = await tx.wait()
                // Verify that the event outputs are equal to the deposit data parameters
                assertDepositedEvent(receipt, deposit)
            })

            // Test for the ERC1271 wallet using ETHSign
            it(`Should sign and encode a valid deposit for an ERC1271 wallet using ETHSign to use on the Arbitrum bridge.`, async () => {
                // Deploy a new ERC1271WalletETHSign wallet contract as the signer
                const erc1271Wallet = await deployERC1271WalletETHSign(wallet.user)
                const deposit = {
                    // Override the default deposit data for the Arbitrum bridge
                    ...defaultDeposit,
                    l1TokenAddr: token.USDT.address,
                    l2Identifier: L2Identifier.Arbitrum,
                    l2TokenAddr: token.USDTForArbitrumBridge.address,
                    sender: erc1271Wallet.address,
                    recipient: erc1271Wallet.address,
                    data: encodingHelper.encodeL2ArbitrumDepositData(
                        wallet.user.address,
                        arbitrumGasData,
                    ),
                }
                // Obtain a specific amount of tokens and approve their to be used by the AllowanceTarget contract
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    deposit.l1TokenAddr,
                    deposit.amount,
                    {
                        walletContract: erc1271Wallet,
                    },
                )
                // Encode the contents of deposit parameters to conform to EIP-712 format
                const digest = await signingHelper.getL2DepositEIP712Digest(deposit, {
                    chainId: network.chainId,
                    verifyingContract: tokenlon.L2Deposit.address,
                })
                // Sign the digest data using the EOA
                const digestSigned = await wallet.user.signMessage(ethers.utils.arrayify(digest))
                // Convert the signed digest into the WalletBytes32 format.
                const signature = signingHelper.composeSignature(
                    digestSigned,
                    SignatureType.WalletBytes32,
                )
                // Encode the deposit and signed data into a byte string with the function signatures hash prefix.
                const payload = encodingHelper.encodeL2Deposit({
                    deposit: deposit,
                    depositSig: signature,
                })
                // Send a transaction to the L2Deposit contract through the UserProxy contract
                const tx = await tokenlon.UserProxy.connect(wallet.user).toL2Deposit(payload, {
                    value: calculateArbitrumCallValue(arbitrumGasData),
                })
                // Wait for the block to be mined and the transaction will be completed
                const receipt = await tx.wait()
                // Verify that the event outputs are equal to the deposit data parameters
                assertDepositedEvent(receipt, deposit)
            })
        })

        /* Test on the Optimism bridge */

        describe("Deposit on the Optimism bridge", () => {
            // Test for the EOA
            it(`Should sign and encode a valid deposit for an EOA to use on the Optimism bridge.`, async () => {
                const deposit = {
                    // Override the default deposit data for the Optimism bridge
                    ...defaultDeposit,
                    l2Identifier: L2Identifier.Optimism,
                    l1TokenAddr: token.USDT.address,
                    l2TokenAddr: token.USDTForOptimismBridge.address, // It does not matter for Optimism bridge
                    data: encodingHelper.encodeL2OptimismDepositData(optimismGasData),
                }
                // Obtain a specific amount of tokens and approve their to be used by the AllowanceTarget contract
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    deposit.l1TokenAddr,
                    deposit.amount,
                )
                // Sign the deposit data using the EOA
                const depositSig = await signingHelper.signL2Deposit(deposit, {
                    type: SignatureType.EIP712,
                    signer: wallet.user,
                    verifyingContract: tokenlon.L2Deposit.address,
                })
                // Encode the deposit and signed data into a byte string with the function signatures hash prefix.
                const payload = encodingHelper.encodeL2Deposit({
                    deposit: deposit,
                    depositSig: depositSig,
                })
                // Send a transaction to the L2Deposit contract through the UserProxy contract
                const tx = await tokenlon.UserProxy.connect(wallet.user).toL2Deposit(payload)
                // Wait for the block to be mined and the transaction will be completed
                const receipt = await tx.wait()
                // Verify that the event outputs are equal to the deposit data parameters
                assertDepositedEvent(receipt, deposit)
            })

            // Test for the ERC1271 wallet
            it(`Should sign and encode a valid deposit for an ERC1271 wallet to use on the Optimism bridge.`, async () => {
                // Deploy a new ERC1271 wallet contract as the signer
                const erc1271Wallet = await deployERC1271Wallet(wallet.user)
                const deposit = {
                    // Override the default deposit data for the Optimism bridge
                    ...defaultDeposit,
                    l1TokenAddr: token.USDT.address,
                    l2Identifier: L2Identifier.Optimism,
                    l2TokenAddr: token.USDTForOptimismBridge.address, // It does not matter for Optimism bridge
                    sender: erc1271Wallet.address,
                    recipient: erc1271Wallet.address,
                    data: encodingHelper.encodeL2OptimismDepositData(optimismGasData),
                }
                // Obtain a specific amount of tokens and approve their to be used by the AllowanceTarget contract
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    deposit.l1TokenAddr,
                    deposit.amount,
                    {
                        walletContract: erc1271Wallet,
                    },
                )
                // Sign the deposit data using the WalletBytes32
                const depositSig = await signingHelper.signL2Deposit(deposit, {
                    type: SignatureType.WalletBytes32,
                    signer: wallet.user,
                    verifyingContract: tokenlon.L2Deposit.address,
                })
                // Encode the deposit and signed data into a byte string with the function signatures hash prefix.
                const payload = encodingHelper.encodeL2Deposit({
                    deposit: deposit,
                    depositSig: depositSig,
                })
                // Send a transaction to the L2Deposit contract through the UserProxy contract
                const tx = await tokenlon.UserProxy.connect(wallet.user).toL2Deposit(payload)
                // Wait for the block to be mined and the transaction will be completed
                const receipt = await tx.wait()
                // Verify that the event outputs are equal to the deposit data parameters
                assertDepositedEvent(receipt, deposit)
            })

            // Test for the ERC1271 wallet using ETHSign

            it(`Should sign and encode a valid deposit for an ERC1271 wallet using ETHSign to use on the Optimism bridge.`, async () => {
                // Deploy a new ERC1271WalletETHSign wallet contract as the signer
                const erc1271Wallet = await deployERC1271WalletETHSign(wallet.user)
                const deposit = {
                    // Override the default deposit data for the Optimism bridge
                    ...defaultDeposit,
                    l1TokenAddr: token.USDT.address,
                    l2Identifier: L2Identifier.Optimism,
                    l2TokenAddr: token.USDTForOptimismBridge.address, // It does not matter for Optimism bridge
                    sender: erc1271Wallet.address,
                    recipient: erc1271Wallet.address,
                    data: encodingHelper.encodeL2OptimismDepositData(optimismGasData),
                }
                // Obtain a specific amount of tokens and approve their to be used by the AllowanceTarget contract
                await dealTokenAndApprove(
                    wallet.user,
                    tokenlon.AllowanceTarget,
                    deposit.l1TokenAddr,
                    deposit.amount,
                    {
                        walletContract: erc1271Wallet,
                    },
                )
                // Encode the contents of deposit parameters to conform to EIP-712 format
                const digest = await signingHelper.getL2DepositEIP712Digest(deposit, {
                    chainId: network.chainId,
                    verifyingContract: tokenlon.L2Deposit.address,
                })
                // Sign the digest data using the EOA
                const digestSigned = await wallet.user.signMessage(ethers.utils.arrayify(digest))
                // Convert the signed digest into the WalletBytes32 format.
                const signature = signingHelper.composeSignature(
                    digestSigned,
                    SignatureType.WalletBytes32,
                )
                // Encode the deposit and signed data into a byte string with the function signatures hash prefix.
                const payload = encodingHelper.encodeL2Deposit({
                    deposit: deposit,
                    depositSig: signature,
                })
                // Send a transaction to the L2Deposit contract through the UserProxy contract
                const tx = await tokenlon.UserProxy.connect(wallet.user).toL2Deposit(payload)
                // Wait for the block to be mined and the transaction will be completed
                const receipt = await tx.wait()
                // Verify that the event outputs are equal to the deposit data parameters
                assertDepositedEvent(receipt, deposit)
            })
        })

        /* Utils */

        // Calculate the value of the call as gas for the Arbitrum bridge
        function calculateArbitrumCallValue(data: L2ArbitrumDepositData) {
            const maxSubmissionCost = BigNumber.from(data.maxSubmissionCost)
            const maxGas = BigNumber.from(data.maxGas)
            return maxSubmissionCost.add(maxGas.mul(data.gasPriceBid))
        }

        // Verify that the event data are equal to the deposit data parameters
        function assertDepositedEvent(receipt: ContractReceipt, deposit: L2Deposit) {
            // Parse the event data
            const [{ args }] = parseLogsByName(tokenlon.L2Deposit, "Deposited", receipt.logs)
            // Verify the deposit data
            expect(args.l2Identifier).to.equal(deposit.l2Identifier)
            expect(args.l1TokenAddr).to.equal(deposit.l1TokenAddr)
            expect(args.l2TokenAddr).to.equal(deposit.l2TokenAddr)
            expect(args.sender).to.equal(deposit.sender)
            expect(args.recipient).to.equal(deposit.recipient)
            expect(args.amount).to.equal(deposit.amount)
            expect(args.data).to.equal(deposit.data)
        }
    })
}
