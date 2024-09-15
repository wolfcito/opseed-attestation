import { cardDataMapper } from '../../mapper/index.js'
import { GoodFrameProps } from './attestation.type.js'

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
