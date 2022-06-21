import { ethers } from "ethers"

export function toBytes32(value: number | ethers.utils.BytesLike | ethers.utils.Hexable): string {
    return ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.arrayify(value), 32))
}
