import { BigNumber, BigNumberish } from "ethers"
import { ethers } from "hardhat"
import { Addressable, getAddress } from "./address"
import { toBytes32 } from "./bytes"

export async function dealETH(target: Addressable, amount: BigNumberish) {
    const [operator] = await ethers.getSigners()
    await operator.sendTransaction({
        to: await getAddress(target),
        value: amount,
    })
}

export async function dealToken(target: Addressable, token: Addressable, amount: BigNumberish) {
    const slot = await probeBalanceStorageSlot(await getAddress(token))
    const index = getStorageMapIndex(await getAddress(target), slot)
    await setStorageNumber(await getAddress(token), index, amount)
}

async function probeBalanceStorageSlot(token: Addressable): Promise<number> {
    const tokenAddr = await getAddress(token)
    const tokenContract = await ethers.getContractAt("IERC20", tokenAddr)
    const account = ethers.constants.AddressZero
    for (let i = 0; i <= 100; i++) {
        const index = getStorageMapIndex(account, i)

        // Ensure this storage stores number
        const v = await ethers.provider.send("eth_getStorageAt", [tokenAddr, index])
        let b: BigNumber
        try {
            b = BigNumber.from(v)
        } catch (e) {
            continue
        }

        // Probe to check if this storage is related to balance
        const p = b.add(1)
        await setStorageNumber(tokenAddr, index, p)
        const pb = await tokenContract.balanceOf(account)
        await setStorageNumber(tokenAddr, index, b)

        if (pb.eq(p)) {
            return i
        }
    }
    throw new Error(`Cannot find balance storage slot for token ${tokenAddr}`)
}

function getStorageMapIndex(key: string, slot: number): string {
    let index = ethers.utils.solidityKeccak256(["uint256", "uint256"], [key, slot])
    // Remove padding for JSON RPC
    while (index.startsWith("0x0")) {
        index = "0x" + index.slice(3)
    }
    return index
}

async function setStorageNumber(addr: string, index: string, value: BigNumberish) {
    await ethers.provider.send("hardhat_setStorageAt", [
        addr,
        index,
        toBytes32(BigNumber.from(value)),
    ])
}

// function toBytes32(bn: BigNumber): string {
//     return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32))
// }
