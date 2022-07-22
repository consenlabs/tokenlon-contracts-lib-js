import {
    BaseContract,
    BigNumber,
    BigNumberish,
    ContractTransaction,
    Overrides,
    Signer,
} from "ethers"
import { ethers } from "hardhat"
import { setBalance } from "@nomicfoundation/hardhat-network-helpers"

import { Addressable, getAddress } from "./address"
import { BytesConvertible, toBytes32 } from "./bytes"

export async function dealETH(target: Addressable, amount: BigNumberish) {
    await setBalance(await getAddress(target), BigNumber.from(amount))
}

export async function dealToken(target: Addressable, token: Addressable, amount: BigNumberish) {
    const slot = await probeBalanceStorageSlot(await getAddress(token))
    const index = getStorageMapIndex(await getAddress(target), slot)
    await setStorageAt(await getAddress(token), index, BigNumber.from(amount))
}

export interface WalletContract extends BaseContract {
    connect(signer: Signer): this
    approve(
        spender: string,
        tokenAddr: string,
        amount: BigNumberish,
        overrides?: Overrides & { from?: string },
    ): Promise<ContractTransaction>
}

export async function dealTokenAndApprove(
    target: Signer,
    spender: Addressable,
    token: Addressable,
    amount: BigNumberish,
    options: {
        walletContract?: WalletContract
    } = {},
) {
    const targetAddr = await getAddress(options.walletContract ?? target)

    await dealToken(targetAddr, token, amount)

    if (options.walletContract) {
        await options.walletContract
            .connect(target)
            .approve(await getAddress(spender), await getAddress(token), amount)
        return
    }
    const tokenContract = await ethers.getContractAt("IERC20", await getAddress(token))
    await tokenContract.connect(target).approve(await getAddress(spender), amount)
}

async function probeBalanceStorageSlot(token: Addressable): Promise<number> {
    const account = ethers.constants.AddressZero
    const tokenAddress = await getAddress(token)
    const tokenContract = await ethers.getContractAt("IERC20", tokenAddress)
    for (let i = 0; i <= 100; i++) {
        const index = getStorageMapIndex(account, i)
        // Ensure this storage stores number
        const v = await getStorageAt(tokenAddress, index)
        let b: BigNumber
        try {
            b = BigNumber.from(v)
        } catch (e) {
            continue
        }
        // Probe to check if this storage is related to balance
        const p = b.add(1)
        await setStorageAt(tokenAddress, index, p)
        const pb = await tokenContract.balanceOf(account)
        await setStorageAt(tokenAddress, index, b)

        if (pb.eq(p)) {
            return i
        }
    }
    throw new Error(`Cannot find balance storage slot for token ${tokenAddress}`)
}

function getStorageMapIndex(key: string, slot: number): string {
    return ethers.utils.solidityKeccak256(["uint256", "uint256"], [key, slot])
}

function getStorageAt(address: string, index: string) {
    return ethers.provider.send("eth_getStorageAt", [address, index])
}

async function setStorageAt(address: string, index: string, value: BytesConvertible) {
    await ethers.provider.send("hardhat_setStorageAt", [
        address,
        // index here must be a QUANTITY value, which is a hex string without leading zeros
        // (0xabc instead of 0x0abc)
        ethers.utils.hexValue(index),
        toBytes32(BigNumber.from(value)),
    ])
}
