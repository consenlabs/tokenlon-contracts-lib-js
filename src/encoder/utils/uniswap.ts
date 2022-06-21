const FEE_SIZE = 3

export enum UniswapV3Fee {
    LOW = 500,
    MEDIUM = 3000,
    HIGH = 10000,
}

export function encodeUniswapV3Path(path: string[], fees: UniswapV3Fee[]): string {
    if (path.length != fees.length + 1) {
        throw new Error("path/fee lengths do not match")
    }

    let encoded = "0x"
    for (let i = 0; i < fees.length; i++) {
        // 20 byte encoding of the address
        encoded += path[i].slice(2)
        // 3 byte encoding of the fee
        encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, "0")
    }
    // encode the final token
    encoded += path[path.length - 1].slice(2)

    return encoded.toLowerCase()
}
