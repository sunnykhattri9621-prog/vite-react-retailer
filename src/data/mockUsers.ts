export interface User {
  id: string
  name: string
  password: string
  email: string
}

const MOCK_USERS = {
  hotels: [
    { id: 'h1', name: 'Grand Hotel Delhi', password: 'hotel123', email: 'grand@hotel.com' },
    { id: 'h2', name: 'Taj Punjabi', password: 'taj123', email: 'taj@hotel.com' },
    { id: 'h3', name: 'Mumbai Palace', password: 'palace123', email: 'palace@hotel.com' }
  ],
  dealers: [
    { id: 'd1', name: 'Fresh Vegetables Co.', password: 'dealer123', email: 'fresh@dealer.com' },
    { id: 'd2', name: 'Premium Produce', password: 'premium123', email: 'premium@dealer.com' }
  ]
}

export default MOCK_USERS