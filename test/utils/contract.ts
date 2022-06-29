import { Contract } from "ethers"
import { Log } from "@ethersproject/abstract-provider"

export function parseLogsByName(contract: Contract, eventName: string, logs: Log[]) {
    const topic = contract.interface.getEventTopic(eventName)
    return logs
        .filter((log) => log.topics[0] == topic && contract.address == log.address)
        .map((log) => contract.interface.parseLog(log))
}
