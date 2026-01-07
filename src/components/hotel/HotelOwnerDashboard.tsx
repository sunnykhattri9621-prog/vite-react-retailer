import { useState, useEffect } from 'react'
import { User } from '../../data/mockUsers'
import OrderForm from './OrderForm'


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

interface HotelOwnerDashboardProps {
  user: User
  orders: Order[]
  setOrders: (orders: Order[]) => void
  itemPrices: ItemPrices
}

function HotelOwnerDashboard({ user, orders, setOrders, itemPrices }: HotelOwnerDashboardProps): JSX.Element {
  const [showNewOrder, setShowNewOrder] = useState<boolean>(false)
  const [todayOrders, setTodayOrders] = useState<Order[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const hotelOrders = orders.filter(o => o.hotelId === user.id && o.date === today)
    setTodayOrders(hotelOrders)
  }, [orders, user.id])

  const calculateTotal = (): number => {
    return todayOrders.reduce((sum, order) => {
      const key = order.itemName.toLowerCase()
      const price = itemPrices[key]?.amount || 0
      return sum + (order.quantity * price)
    }, 0)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Today's Orders</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{todayOrders.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Items Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {todayOrders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {todayOrders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Total Bill</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹{calculateTotal().toFixed(2)}</p>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Today's Order</h3>
          <button onClick={() => setShowNewOrder(!showNewOrder)} className="btn-primary pulse-btn">
            {showNewOrder ? '✕ Cancel' : '+ Add Items'}
          </button>
        </div>

        {showNewOrder && (
          <OrderForm user={user} orders={orders} setOrders={setOrders} onClose={() => setShowNewOrder(false)} />
        )}
        
        {Object.keys(itemPrices).length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-3">📋 Available Items & Prices:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(itemPrices).map(([key, priceData]) => (
                <div key={key} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition">
                  <p className="font-semibold text-gray-800 capitalize">{key}</p>
                  <p className="text-green-600 font-bold">₹{priceData.amount.toFixed(2)}/{priceData.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="table-header">Item</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Unit</th>
                  <th className="table-header">Price/Unit</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map(order => {
                  const key = order.itemName.toLowerCase()
                  const unitPrice = itemPrices[key]?.amount || 0
                  const total = order.quantity * unitPrice
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="table-cell font-semibold">{order.itemName}</td>
                      <td className="table-cell">{order.quantity}</td>
                      <td className="table-cell">{order.unit}</td>
                      <td className="table-cell">₹{unitPrice.toFixed(2)}</td>
                      <td className="table-cell font-bold text-green-600">₹{total.toFixed(2)}</td>
                      <td className="table-cell">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          order.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No orders yet. Click "Add Items" to start!</p>
        )}
      </div>
    </div>
  )
}

export default HotelOwnerDashboard