import { Contract, Signer } from "ethers"
import { ethers } from "hardhat"
import { Log } from "@ethersproject/abstract-provider"

export async function deployERC1271Wallet(owner: Signer) {
    return (await ethers.getContractFactory("ERC1271Wallet", owner)).deploy()
}

export function parseLogsByName(contract: Contract, eventName: string, logs: Log[]) {
    const topic = contract.interface.getEventTopic(eventName)
    return logs
        .filter((log) => log.topics[0] == topic && contract.address == log.address)
        .map((log) => contract.interface.parseLog(log))
}
