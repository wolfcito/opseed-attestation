import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'

import { handle } from 'frog/vercel'
import { Button, Frog, TextInput } from 'frog'
import { ethers } from 'ethers'

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
  let INVALID_ADDRESS = ''

  const currentAddress = deriveState((previousState) => {
    try {
      if (inputText && ethers.utils.isAddress(toChecksumAddress(inputText))) {
        previousState.currentAddress = toChecksumAddress(inputText)
      }
    } catch (error) {
      console.error('Invalid address')
      INVALID_ADDRESS = 'Invalid address'
    }
  })

  if (INVALID_ADDRESS === 'Invalid address') {
    return c.res({
      image: <BadFrame address={INVALID_ADDRESS} />,
      intents: [
        <TextInput placeholder="Enter address... 0x1234..." />,
        <Button value="dec">{'<<'}</Button>,
        <Button value="att">Attestation</Button>,
        <Button value="inc">{'>>'}</Button>,
      ],
    })
  }

  const address = currentAddress.currentAddress ?? frameData?.address ?? ''

  const getAttestations = async (address: string) => {
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

  const state = deriveState((previousState) => {
    if (
      buttonValue === 'inc' &&
      previousState.count < attestationData.length - 1
    ) {
      previousState.count++
    } else if (buttonValue === 'dec' && previousState.count > 0) {
      previousState.count--
    }
  })
  const fullInfo = attestationMapper(attestationData, state)

  currentAttestation =
    fullInfo && fullInfo?.length > 0 ? fullInfo[state.count] : null

  return c.res({
    image:
      currentAttestation !== null && currentAttestation !== undefined ? (
        <GoodFrame fullInfo={currentAttestation} address={address} />
      ) : (
        <BadFrame address={address} />
      ),
    intents: [
      <TextInput placeholder="Enter address... 0x1234..." />,
      <Button value="dec">{'<<'}</Button>,
      <Button value="att">Attestation</Button>,
      <Button value="inc">{'>>'}</Button>,
    ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)

export function GoodFrame({ fullInfo, address }: GoodFrameProps) {
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
            background: '#39fdcc50',
            padding: '5px 10px',
            color: '#00693f',
          }}
        >
          {cardData.location}
        </div>
        <div
          style={{
            fontSize: '24px',
            padding: '5px 10px',
            borderRadius: '20px',
            background: '#a9baebad',
            color: '#4c63b6',
          }}
        >
          {`Attestation ${shortenAddress(address)}`}
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

export function BadFrame({ address }: BadFrameProps) {
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
          display: 'flex',
          fontSize: '48px',
          fontWeight: '600',
          margin: '32px 52px 0px 52px',
          color: '#ff0000',
          alignItems: 'center',
        }}
      >
        <img
          src="https://www.optimism.io/sparkle.svg"
          alt="bgattestation"
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'cover',
          }}
        />
        Stay Optimistic
      </div>
      <div
        style={{
          fontSize: '32px',
          color: '#374151',
          margin: '32px 52px 0px 52px',
        }}
      >
        Discover the attestations you obtained in SEED Latam and Optimism
        Español!
      </div>
      {address !== null && address.length > 0 ? (
        <div
          style={{
            fontSize: '30px',
            color: '#374151',
            margin: '32px 52px 0px 52px',
          }}
        >
          {`${
            address.startsWith('0x') ? shortenAddress(address) : address
          } has no attestations.`}
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          bottom: 0,
          right: 0,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          fontSize: '32px',
          margin: '100px 52px 0px 52px',
          position: 'absolute',
        }}
      >
        🐺 @wolfcito
      </div>
    </div>
  )
}

const toChecksumAddress = (address: string): string => {
  return ethers.utils.getAddress(address.toLowerCase())
}

const shortenAddress = (address: string) => {
  if (address.length <= 10) {
    return address
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
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
  readonly address: string
}

export interface BadFrameProps {
  readonly address: string
}
