import { Wallet, providers } from "ethers"
import { SigningHelper } from "@src/v6/signing"
import { SignatureType, EIP712Signer } from "@src/signing"
import { AllowFill, GenericSwapData, LimitOrder, RFQOffer, RFQTx } from "@src/v6/types"

describe("Generate V6 EIP712 signature examples", async () => {
    const signingHelper = new SigningHelper()

    let provider: providers.JsonRpcProvider
    let eip712signer: EIP712Signer
    let chainId: number
    let wallet: Wallet
    let contract: string

    beforeEach(async () => {
        // NOTE: Set provider url to your needs
        provider = new providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli")
        chainId = (await provider.getNetwork()).chainId

        wallet = new Wallet(signingHelper.generateRandomBytesHex(32), provider)
        eip712signer = {
            getAddress: async () => {
                return wallet.getAddress()
            },
            getChainId: async () => {
                return Number((await provider.getNetwork()).chainId)
            },
            _signTypedData: async (domain, types, value) => {
                return wallet._signTypedData(domain, types, value)
            },
        }
        contract = signingHelper.generateRandomBytesHex(20)
    })

    it("AllowFill test", async () => {
        const allowFill: AllowFill = {
            orderHash: signingHelper.generateRandomBytesHex(32),
            taker: signingHelper.generateRandomBytesHex(20),
            fillAmount: 100,
            expiry: 3376656000,
            salt: 123,
        }

        const sig = await signingHelper.signAllowFill(allowFill, {
            type: SignatureType.EIP712,
            signer: eip712signer,
            verifyingContract: contract,
        })

        console.log(
            `AllowFill example payload:\n==============================\n${JSON.stringify(
                {
                    ...allowFill,
                    expectedSig: sig,
                    signingKey: wallet.privateKey,
                    chainId: chainId,
                    verifyingContract: contract,
                    typehash: signingHelper.getAllowFillEIP712Typehash(),
                },
                null,
                2,
            )}`,
        )
    })

    it("GenericSwapData test", async () => {
        const genericSwapData: GenericSwapData = {
            maker: signingHelper.generateRandomBytesHex(20),
            takerToken: signingHelper.generateRandomBytesHex(20),
            takerTokenAmount: 100,
            makerToken: signingHelper.generateRandomBytesHex(20),
            makerTokenAmount: 100,
            minMakerTokenAmount: 50,
            expiry: 3376656000,
            salt: 123,
            recipient: signingHelper.generateRandomBytesHex(20),
            strategyData: signingHelper.generateRandomBytesHex(68),
        }

        const sig = await signingHelper.signGenericSwapData(genericSwapData, {
            type: SignatureType.EIP712,
            signer: eip712signer,
            verifyingContract: contract,
        })

        console.log(
            `GenericSwapData example payload:\n=================================\n${JSON.stringify(
                {
                    ...genericSwapData,
                    expectedSig: sig,
                    signingKey: wallet.privateKey,
                    chainId: chainId,
                    verifyingContract: contract,
                    typehash: signingHelper.getGenericSwapDataEIP712Typehash(),
                },
                null,
                2,
            )}`,
        )
    })

    it("LimitOrder test", async () => {
        const limitOrder: LimitOrder = {
            taker: signingHelper.generateRandomBytesHex(20),
            maker: signingHelper.generateRandomBytesHex(20),
            takerToken: signingHelper.generateRandomBytesHex(20),
            takerTokenAmount: 100,
            makerToken: signingHelper.generateRandomBytesHex(20),
            makerTokenAmount: 100,
            makerTokenPermit: signingHelper.generateRandomBytesHex(68),
            feeFactor: 10,
            expiry: 3376656000,
            salt: 123,
        }

        const sig = await signingHelper.signLimitOrder(limitOrder, {
            type: SignatureType.EIP712,
            signer: eip712signer,
            verifyingContract: contract,
        })

        console.log(
            `LimitOrder example payload:\n=================================\n${JSON.stringify(
                {
                    ...limitOrder,
                    expectedSig: sig,
                    signingKey: wallet.privateKey,
                    chainId: chainId,
                    verifyingContract: contract,
                    typehash: signingHelper.getLimitOrderEIP712Typehash(),
                },
                null,
                2,
            )}`,
        )
    })

    it("RFQOffer test", async () => {
        const rfqOffer: RFQOffer = {
            taker: signingHelper.generateRandomBytesHex(20),
            maker: signingHelper.generateRandomBytesHex(20),
            takerToken: signingHelper.generateRandomBytesHex(20),
            takerTokenAmount: 100,
            makerToken: signingHelper.generateRandomBytesHex(20),
            makerTokenAmount: 100,
            feeFactor: 100,
            flags: 25,
            expiry: 3376656000,
            salt: 123,
        }

        const sig = await signingHelper.signRFQOffer(rfqOffer, {
            type: SignatureType.EIP712,
            signer: eip712signer,
            verifyingContract: contract,
        })

        console.log(
            `RFQOffer example payload:\n=================================\n${JSON.stringify(
                {
                    ...rfqOffer,
                    expectedSig: sig,
                    signingKey: wallet.privateKey,
                    chainId: chainId,
                    verifyingContract: contract,
                    typehash: signingHelper.getRFQOfferEIP712Typehash(),
                },
                null,
                2,
            )}`,
        )
    })

    it("RFQTx test", async () => {
        const rfqOffer: RFQOffer = {
            taker: signingHelper.generateRandomBytesHex(20),
            maker: signingHelper.generateRandomBytesHex(20),
            takerToken: signingHelper.generateRandomBytesHex(20),
            takerTokenAmount: 100,
            makerToken: signingHelper.generateRandomBytesHex(20),
            makerTokenAmount: 100,
            feeFactor: 100,
            flags: 25,
            expiry: 3376656000,
            salt: 123,
        }

        const rfqTx: RFQTx = {
            recipient: signingHelper.generateRandomBytesHex(20),
            takerRequestAmount: 150,
            rfqOffer: rfqOffer,
        }

        const sig = await signingHelper.signRFQTx(rfqTx, {
            type: SignatureType.EIP712,
            signer: eip712signer,
            verifyingContract: contract,
        })

        console.log(
            `RFQTx example payload:\n=================================\n${JSON.stringify(
                {
                    ...rfqTx,
                    expectedSig: sig,
                    signingKey: wallet.privateKey,
                    chainId: chainId,
                    verifyingContract: contract,
                    typehash: signingHelper.getRFQTxEIP712Typehash(),
                },
                null,
                2,
            )}`,
        )
    })
})
