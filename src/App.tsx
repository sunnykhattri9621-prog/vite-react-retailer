import { useState, useEffect } from 'react'
import LoginPage from './components/auth/LoginPage'
import Header from './components/layout/Header'
import HotelOwnerDashboard from './components/hotel/HotelOwnerDashboard'
import DealerDashboard from './components/dealer/DealerDashboard'


interface User {
  id: string
  name: string
  password: string
  email: string
}

interface Order {
  id: string
  hotelId: string
  hotelName: string
  itemName: string
  quantity: number
  unit: string
  date: string
  status: 'pending' | 'partial' | 'completed' | 'unavailable'
  dealerNote: string
  timestamp: string
}

interface PriceData {
  amount: number
  unit: string
}

type ItemPrices = Record<string, PriceData>

function App(): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'hotel' | 'dealer' | null>(null)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('hotelOrders')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const [itemPrices, setItemPrices] = useState<ItemPrices>(() => {
    try {
      const saved = localStorage.getItem('itemPrices')
      return saved ? JSON.parse(saved) : {}
    } catch (e) {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('hotelOrders', JSON.stringify(orders))
    } catch (e) {
      console.log('Storage error:', e)
    }
  }, [orders])

  useEffect(() => {
    try {
      localStorage.setItem('itemPrices', JSON.stringify(itemPrices))
    } catch (e) {
      console.log('Storage error:', e)
    }
  }, [itemPrices])

  if (!currentUser) {
    return <LoginPage setCurrentUser={setCurrentUser} setUserType={setUserType} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={currentUser} 
        userType={userType} 
        onLogout={() => { 
          setCurrentUser(null)
          setUserType(null)
        }} 
      />
      
      {userType === 'hotel' ? (
        <HotelOwnerDashboard 
          user={currentUser} 
          orders={orders} 
          setOrders={setOrders} 
          itemPrices={itemPrices} 
        />
      ) : (
        <DealerDashboard 
          user={currentUser} 
          orders={orders} 
          setOrders={setOrders} 
          itemPrices={itemPrices} 
          setItemPrices={setItemPrices} 
        />
      )}
    </div>
  )
}

export default App