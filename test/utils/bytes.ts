import { ethers } from "ethers"

export type BytesConvertible = number | ethers.utils.BytesLike | ethers.utils.Hexable

export function toBytes32(value: BytesConvertible): string {
    return ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.arrayify(value), 32))
}
