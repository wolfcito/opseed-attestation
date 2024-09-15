import { Attestation, State } from '../types/index.js'

export const attestationMapper = (
  attestationData: Attestation[],
  state: State,
) => {
  if (
    attestationData === null ||
    attestationData === undefined ||
    attestationData.length < 0
  )
    return null
  const myAttestation = attestationData.map(
    ({ recipient, schema: { creator, schemaNames } }) => ({
      recipient: recipient,
      creator: creator,
      name: schemaNames[0]?.name,
      attestations: JSON.parse(attestationData[state.count].decodedDataJson),
    }),
  )
  return myAttestation
}
