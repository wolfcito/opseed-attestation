import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'

import { handle } from 'frog/vercel'
import { Button, Frog, TextInput } from 'frog'
import { Attestation, AttestationData, State } from '../types/index.js'
import { attestationMapper } from '../mapper/index.js'
import { BadFrame, GoodFrame } from '../frame/index.js'

export const app = new Frog<{ State: State }>({
  assetsPath: '/',
  basePath: '/api',
  title: 'OPTIMISM ESPAÑOL EVENTS',
  initialState: {
    count: 0,
  },
})

app.frame('/', async (c) => {
  const { inputText, deriveState, buttonValue, frameData } = c
  const address = inputText ?? frameData?.address ?? ''
  console.log('c:', c)

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
        <GoodFrame fullInfo={currentAttestation} count={state.count} />
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
