export interface AttestationData {
  data: {
    attestations: Attestation[]
  }
}

export interface Attestation {
  recipient: string
  schema: Schema
  decodedDataJson: string
}

export interface Schema {
  creator: string
  schemaNames: SchemaName[]
}

export interface SchemaName {
  name: string
}

export interface AttrProps {
  name: string
  type: string
  signature: string
  value: [Object]
}

export type State = {
  count: number
}
