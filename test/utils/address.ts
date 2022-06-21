interface GetAddressFunc {
    getAddress(): Promise<string>
}

interface GetAddressProp {
    address: string
}

export type Addressable = GetAddressFunc | GetAddressProp | string

export function getAddress(target: Addressable): Promise<string> {
    if (typeof target === "string") {
        return Promise.resolve(target)
    }
    if ("address" in target) {
        return Promise.resolve(target.address)
    }
    return target.getAddress()
}
