import { AttrProps } from '../types/opseed-attestation.types.js'

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
