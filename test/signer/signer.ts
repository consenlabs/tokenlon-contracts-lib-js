import { expect } from "chai"
import { SignerNotConnectedError } from "@src/error"
import { SignatureType, Signer } from "@src/signer"

describe("Signer", () => {
    it("Should not allow to sign when no signer connected", async () => {
        const signer = new Signer({
            name: "test",
            version: "test",
        })
        const signWithoutSignerConnected = () =>
            signer.signEIP712(
                {},
                {},
                {
                    type: SignatureType.EIP712,
                    verifyingContract: "0xabc",
                },
            )
        await expect(signWithoutSignerConnected()).to.rejectedWith(SignerNotConnectedError)
    })
})
