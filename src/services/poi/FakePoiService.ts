import type { Poi } from '../../types/poi'

const POIS: Poi[] = [
  // =========================
  // COLOMBIA
  // =========================
  {
    id: 'co-bog-1',
    name: 'La Candelaria (Historic Quarter)',
    city: 'Bogotá',
    country: 'Colombia',
    location: { lat: 4.5981, lng: -74.0758 },
    tags: ['culture', 'history', 'food'],
    popularity: 88,
    durationMin: 150,
  },
  {
    id: 'co-bog-2',
    name: 'Monserrate Viewpoint',
    city: 'Bogotá',
    country: 'Colombia',
    location: { lat: 4.6057, lng: -74.0550 },
    tags: ['nature', 'culture'],
    popularity: 92,
    durationMin: 140,
  },
  {
    id: 'co-med-1',
    name: 'Comuna 13 (Street Art & History)',
    city: 'Medellín',
    country: 'Colombia',
    location: { lat: 6.2442, lng: -75.5812 },
    tags: ['culture', 'history', 'nightlife'],
    popularity: 89,
    durationMin: 150,
  },
  {
    id: 'co-car-1',
    name: 'Walled City Walk',
    city: 'Cartagena',
    country: 'Colombia',
    location: { lat: 10.4236, lng: -75.5253 },
    tags: ['culture', 'history'],
    popularity: 91,
    durationMin: 160,
  },
  {
    id: 'co-sam-1',
    name: 'Beach / Nature Day (Santa Marta area)',
    city: 'Santa Marta',
    country: 'Colombia',
    location: { lat: 11.2408, lng: -74.1990 },
    tags: ['nature', 'relax', 'adventure'],
    popularity: 83,
    durationMin: 360,
  },

  // =========================
  // BRAZIL
  // =========================
  {
    id: 'br-rio-1',
    name: 'Christ the Redeemer View',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    location: { lat: -22.9519, lng: -43.2105 },
    tags: ['culture', 'history'],
    popularity: 95,
    durationMin: 180,
  },
  {
    id: 'br-rio-2',
    name: 'Sugarloaf Mountain',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    location: { lat: -22.9486, lng: -43.1566 },
    tags: ['nature', 'adventure'],
    popularity: 92,
    durationMin: 160,
  },
  {
    id: 'br-sp-1',
    name: 'Avenida Paulista Walk',
    city: 'São Paulo',
    country: 'Brazil',
    location: { lat: -23.5614, lng: -46.6565 },
    tags: ['culture', 'food'],
    popularity: 80,
    durationMin: 140,
  },
  {
    id: 'br-foz-1',
    name: 'Iguazu Falls (Brazil side)',
    city: 'Foz do Iguaçu',
    country: 'Brazil',
    location: { lat: -25.6953, lng: -54.4367 },
    tags: ['nature', 'adventure'],
    popularity: 94,
    durationMin: 300,
  },
  {
    id: 'br-sal-1',
    name: 'Pelourinho (Historic Center)',
    city: 'Salvador',
    country: 'Brazil',
    location: { lat: -12.9718, lng: -38.5108 },
    tags: ['culture', 'history'],
    popularity: 86,
    durationMin: 160,
  },
]

export async function fetchPoisByCountry(country: string): Promise<Poi[]> {
  await new Promise((r) => setTimeout(r, 350))

  const key = country.trim().toLowerCase()
  const aliases: Record<string, string> = {
    colombia: 'colombia',
    kolumbien: 'colombia',
    brazil: 'brazil',
    brasil: 'brazil',
  }
  const normalized = aliases[key] ?? key

  return POIS.filter((p) => p.country.toLowerCase() === normalized)
}