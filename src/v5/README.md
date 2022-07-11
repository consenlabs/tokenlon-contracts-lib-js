# tokenlon-contracts-lib-js/v5

Tokenlon `v5` library supports the following Tokenlon strategy contracts:

-   Mainnet
    -   AMM
    -   RFQ
-   Arbitrum:
    -   Limit Order

> Addresses of Tokenlon strategy contracts can be found in [tokenlon-contracts](https://github.com/consenlabs/tokenlon-contracts).

## Usage

### Examples

> Please refer to library tests under [test/v5](https://github.com/consenlabs/tokenlon-contracts-lib-js/blob/main/test/v5/) for more concrete examples of interacting with specific strategy contract.

-   EIP712 signature from EOA wallet

```typescript
import { ethers } from "ethers"
import { SignatureType } from "tokenlon-contracts-lib-js/signer"
import { AMMOrder, signer, encoder } from "tokenlon-contracts-lib-js/v5"

declare const user: ethers.Wallet
declare const order: AMMOrder

const signature = await signer.signAMMOrder(order, {
    type: SignatureType.EIP712,
    signer: user,
    verifyingContract: "0x4a14347083B80E5216cA31350a2D21702aC3650d", // Address of AMMWrapperWithPath
})

const payload = encoder.encodeAMMTrade({
    ...order,
    feeFactor: 0,
    signature,
})

// Payload generated by encoder can be directly sent to Tokenlon proxy
await Tokenlon.connect(user).toAMM(payload)
```

-   EIP712 signature to ERC1271 wallet

```typescript
import { ethers } from "ethers"
import { SignatureType } from "tokenlon-contracts-lib-js/signer"
import { AMMOrder, signer, encoder } from "tokenlon-contracts-lib-js/v5"

declare const user: ethers.Wallet
declare const userERC1271Wallet: ethers.Contract
// `userAddr` field on order must be set to `userERC1271Wallet.address`
declare const order: AMMOrder

const signature = await signer.signAMMOrder(order, {
    type: SignatureType.WalletBytes32,
    signer: user,
    verifyingContract: "0x4a14347083B80E5216cA31350a2D21702aC3650d", // Address of AMMWrapperWithPath
})

const payload = encoder.encodeAMMTrade({
    ...order,
    feeFactor: 0,
    signature,
})

// Payload generated by encoder can be directly sent to Tokenlon proxy
await Tokenlon.connect(user).toAMM(payload)
```

-   Ethereum Signed Message to ERC1271 wallet

```typescript
import { ethers } from "ethers"
import { SignatureType } from "tokenlon-contracts-lib-js/signer"
import { AMMOrder, signer, encoder } from "tokenlon-contracts-lib-js/v5"

declare const user: ethers.Wallet
declare const userERC1271Wallet: ethers.Contract
// `userAddr` field on order must be set to `userERC1271Wallet.address`
declare const order: AMMOrder

const digest = await signer.getAMMOrderEIP712Digest(order, {
    signer: user,
    verifyingContract: "0x4a14347083B80E5216cA31350a2D21702aC3650d", // Address of AMMWrapperWithPath
})
const digestSigned = await user.signMessage(ethers.utils.arrayify(digest))
const signature = signer.composeSignature(digestSigned, SignatureType.WalletBytes32)

const payload = encoder.encodeAMMTrade({
    ...order,
    feeFactor: 0,
    signature,
})

// Payload generated by encoder can be directly sent to Tokenlon proxy
await Tokenlon.connect(user).toAMM(payload)
```

### Signer

Signer generates signature accepted by Tokenlon strategy contracts.

Signer supports three types of signature: ([source](https://github.com/consenlabs/tokenlon-contracts-lib-js/blob/main/src/signer/types.ts#L3-L7))

> It's recommended to read [RFQ tests](https://github.com/consenlabs/tokenlon-contracts-lib-js/blob/main/test/v5/RFQ.ts#L19) to see how to configure signature types with specific signature format (EIP712, Ethereum Signed Message).

```typescript
enum SignatureType {
    // Signature will be validated by Tokenlon via EIP712
    EIP712 = "02",

    // Signature will be validated by ERC1271 wallet specified on order.
    // Must implement `isValidSignature(bytes,bytes)`
    WalletBytes = "04",

    // Signature will be validated by ERC1271 wallet specified on order.
    // Must implement `isValidSignature(bytes32,bytes)`
    WalletBytes32 = "05",
}
```

Each singing function on signer has the following required options: ([source](https://github.com/consenlabs/tokenlon-contracts-lib-js/blob/main/src/signer/types.ts#L9-L11))

```typescript
type SingingOptions = {
    type: SignatureType

    // A signer implements `EIP712Signer` interface
    // https://github.com/consenlabs/tokenlon-contracts-lib-js/blob/main/src/signer/types.ts#L29-L33
    signer: EIP712Signer

    // Address of Tokenlon strategy contract
    verifyingContract: string
}
```

The `v5` signer implements the following interface:

```typescript
interface Signer {
    /* AMM */

    getAMMOrderEIP712Types(): EIP712Types
    getAMMOrderEIP712Digest(order: AMMOrder, options: EIP712DomainOptions): Promise<string>
    getAMMOrderEIP712StructHash(order: AMMOrder): string

    signAMMOrder(order: AMMOrder, options: SigningOptions): Promise<string>

    /* Limit Order */

    getLimitOrderEIP712Types(): EIP712Types
    getLimitOrderEIP712Digest(order: LimitOrder, options: EIP712DomainOptions): Promise<string>
    getLimitOrderEIP712StructHash(order: LimitOrder): string

    signLimitOrder(order: LimitOrder, options: SigningOptions): Promise<string>

    getLimitOrderFillEIP712Types(): EIP712Types
    getLimitOrderFillEIP712Digest(
        fill: LimitOrderFill,
        options: EIP712DomainOptions,
    ): Promise<string>
    getLimitOrderFillEIP712StructHash(fill: LimitOrderFill): string

    signLimitOrderFill(fill: LimitOrderFill, options: SigningOptions): Promise<string>

    getLimitOrderAllowFillEIP712Types(): EIP712Types
    getLimitOrderAllowFillEIP712Digest(
        allowFill: LimitOrderAllowFill,
        options: EIP712DomainOptions,
    ): Promise<string>
    getLimitOrderAllowFillEIP712StructHash(allowFill: LimitOrderAllowFill): string

    signLimitOrderAllowFill(
        allowFill: LimitOrderAllowFill,
        options: SigningOptions,
    ): Promise<string>

    /* RFQ */

    getRFQOrderEIP712Types(): EIP712Types
    getRFQOrderEIP712Digest(order: RFQOrder, options: EIP712DomainOptions): Promise<string>
    getRFQOrderEIP712StructHash(order: RFQOrder): string

    signRFQOrder(order: RFQOrder, options: SigningOptions): Promise<string>

    getRFQFillEIP712Types(): EIP712Types
    getRFQFillEIP712Digest(fill: RFQFill, options: EIP712DomainOptions): Promise<string>
    getRFQFillEIP712StructHash(order: RFQFill): string

    signRFQFillOrder(fill: RFQFill, options: SigningOptions): Promise<string>
}
```

### Encoder

Encoder encodes data into bytes accepted by Tokenlon strategy contracts.

The `v5` encoder implements the following interface.

```typescript
interface Encoder {
    /* AMM */

    encodeAMMTrade(data: AMMTradeData): string
    encodeAMMTradeWithPath(data: AMMTradeWithPathData): string

    encodeAMMUniswapV3SingleHopData(fee: number): string
    encodeAMMUniswapV3MultiHopsData(path: string[], fees: number[]): string
    encodeAMMCurveData(version: number): string

    /* Limit Order */

    encodeLimitOrderFillByTrader(data: LimitOrderFillByTraderData): string
    encodeLimitOrderFillByProtocol(data: LimitOrderFillByProtocolData): string
    encodeLimitOrderCancel(data: LimitOrderCancelData): string

    /* RFQ */

    encodeRFQFill(data: RFQFillData): string

    /* Vendor */

    encodeUniswapV2Path(path: string[]): string
    encodeUniswapV3Path(path: string[], fees: number[]): string
}
```