import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'

import { handle } from 'frog/vercel'
import { Button, Frog, TextInput } from 'frog'

export const app = new Frog<{ State: State }>({
  assetsPath: '/',
  basePath: '/api',
  title: 'OPTIMISM ESPAÑOL EVENTS',
  initialState: {
    count: 0,
    currentAddress: '',
  },
})

app.frame('/', async (c) => {
  const { inputText, deriveState, buttonValue, frameData } = c

  const currentAddress = deriveState((previousState) => {
    if (inputText) {
      previousState.currentAddress = inputText
    }
  })

  const address = currentAddress.currentAddress ?? frameData?.address ?? ''

  const getAttestations = async (address: string) => {
    // console.log('llamando a getAttestations', address)
    const query = `
      query Attestations($where: AttestationWhereInput) {
        attestations(where: $where) {
          recipient
          decodedDataJson
          schema {
            creator
            schemaNames {
              name
            }
          }
        }
      }
    `

    const variables = {
      where: {
        schemaId: {
          equals:
            '0x7b4cf7eb3949c0be00d0fe1ac03b0c09a410ba701b2431d470a03a19624ca198',
        },
        recipient: {
          equals: address,
        },
      },
    }

    try {
      const response = await fetch('https://optimism.easscan.org/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      const { data }: AttestationData = await response.json()

      return data.attestations
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }

  let currentAttestation

  const attestationData: Attestation[] = await getAttestations(address)
  // console.log('attestationData', attestationData)

  const state = deriveState((previousState) => {
    if (
      buttonValue === 'inc' &&
      previousState.count < attestationData.length - 1
    ) {
      previousState.count++
    } else if (buttonValue === 'dec' && previousState.count > 0) {
      previousState.count--
    }
    // console.log('<<<<previousState>>>>', previousState)
  })
  const fullInfo = attestationMapper(attestationData, state)
  // console.log('fullInfo', { fullInfo })
  // fullInfo?.forEach((attestation) => console.log(attestation.attestations))
  currentAttestation =
    fullInfo && fullInfo?.length > 0 ? fullInfo[state.count] : null

  // console.log('state', state)
  // return

  return c.res({
    image:
      currentAttestation !== null && currentAttestation !== undefined ? (
        <GoodFrame fullInfo={currentAttestation} />
      ) : (
        <BadFrame />
      ),
    intents: [
      <TextInput placeholder="Enter address... 0x1234..." />,
      <Button value="dec">{'<<'}</Button>,
      <Button value="att">Attestation</Button>,
      <Button value="inc">{'>>'}</Button>,
      // status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)

export function GoodFrame({ fullInfo }: GoodFrameProps) {
  const cardData = cardDataMapper(fullInfo.attestations)
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      <img
        src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/optimism/bgsuperchain"
        alt="bgattestation"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.2,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '52px 52px 0px 52px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            borderRadius: '20px',
            background: '#ff000050',
            padding: '5px 10px',
            color: '#ff0000',
          }}
        >
          {cardData.eventType}
        </div>
        <div
          style={{
            fontSize: '24px',
            padding: '5px 10px',
            borderRadius: '20px',
            border: '2px solid #4c63b6',
            background: '#a9baebad',
            color: '#4c63b6',
          }}
        >
          Attestation
        </div>
      </div>

      <div
        style={{
          fontSize: '48px',
          fontWeight: '900',
          margin: '32px 52px 0px 52px',
        }}
      >
        {cardData.eventName}
      </div>

      <div
        style={{
          fontSize: '32px',
          color: '#374151',
          margin: '32px 52px 0px 52px',
        }}
      >
        {cardData.description}
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '32px',
          color: '#374151',
          margin: '32px 52px 0px 52px',
        }}
      >
        📅 {cardData.eventDate}
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '32px',
          color: '#374151',
          margin: '32px 52px 0px 52px',
        }}
      >
        📍 {cardData.location}
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '28px',
          margin: '32px 52px 0px 52px',
        }}
      >
        {cardData.details}
      </div>
    </div>
  )
}

export function BadFrame() {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: 'white',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/optimism/initialbg"
        alt="bgattestation"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.2,
        }}
      />

      <div
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '32px 52px 0px 52px',
        }}
      >
        Stay Optimistic
      </div>
      <div
        style={{
          fontSize: '32px',
          color: '#374151',
          margin: '32px 52px 0px 52px',
        }}
      >
        You don't have any attestations yet.
      </div>
    </div>
  )
}

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

export const cardDataMapper = (attestations: any) => {
  const cardData = {
    eventType: attestations.find(
      (attr: AttrProps) => attr.name === 'Event_type',
    )?.value?.value,
    eventName: attestations.find(
      (attr: AttrProps) => attr.name === 'Event_name',
    )?.value?.value,
    description: attestations.find(
      (attr: AttrProps) => attr.name === 'Description',
    )?.value?.value,
    rarity: attestations.find((attr: AttrProps) => attr.name === 'Rarity')
      ?.value?.value,
    details: attestations.find((attr: AttrProps) => attr.name === 'Details')
      ?.value?.value,
    additionalInfo: attestations.find(
      (attr: AttrProps) => attr.name === 'Additional_info',
    )?.value?.value,
    eventDate: attestations.find(
      (attr: AttrProps) => attr.name === 'Event_date',
    )?.value?.value,
    location: attestations.find((attr: AttrProps) => attr.name === 'Location')
      ?.value?.value,
  }
  // console.log('cardData:', cardData)
  return cardData
}

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
  currentAddress: string
}

export interface GoodFrameProps {
  readonly fullInfo: any
}
