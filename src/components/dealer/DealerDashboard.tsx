import { useState, useEffect } from 'react'
import { User } from '../../data/mockUsers'

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

interface HotelOrder {
  orderId: string
  hotelId: string
  hotelName: string
  quantity: number
  status: 'pending' | 'partial' | 'completed' | 'unavailable'
}

interface AggregatedOrder {
  itemName: string
  totalQuantity: number
  unit: string
  hotels: HotelOrder[]
  price: PriceData
}

interface DealerDashboardProps {
  user: User
  orders: Order[]
  setOrders: (orders: Order[]) => void
  itemPrices: ItemPrices
  setItemPrices: (prices: ItemPrices) => void
}

function DealerDashboard({  orders, setOrders, itemPrices, setItemPrices }: DealerDashboardProps): JSX.Element {
  const [aggregatedOrders, setAggregatedOrders] = useState<AggregatedOrder[]>([])
  const [filterByItem, setFilterByItem] = useState<string>('')
  const [showPriceForm, setShowPriceForm] = useState<boolean>(false)
  const [priceFormData, setPriceFormData] = useState({ itemName: '', price: '', unit: 'kg' })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter(o => o.date === today)
    
    const aggregated: Record<string, AggregatedOrder> = {}
    todayOrders.forEach(order => {
      const key = order.itemName.toLowerCase()
      if (!aggregated[key]) {
        aggregated[key] = {
          itemName: order.itemName,
          totalQuantity: 0,
          unit: order.unit,
          hotels: [],
          price: itemPrices[key] || { amount: 0, unit: order.unit }
        }
      }
      aggregated[key].totalQuantity += parseFloat(order.quantity.toString())
      aggregated[key].hotels.push({
        orderId: order.id,
        hotelId: order.hotelId,
        hotelName: order.hotelName,
        quantity: order.quantity,
        status: order.status
      })
    })

    setAggregatedOrders(Object.values(aggregated))
  }, [orders, itemPrices])

  const handleAddPrice = (): void => {
    if (priceFormData.itemName && priceFormData.price) {
      const key = priceFormData.itemName.toLowerCase()
      setItemPrices({
        ...itemPrices,
        [key]: {
          amount: parseFloat(priceFormData.price),
          unit: priceFormData.unit
        }
      })
      setPriceFormData({ itemName: '', price: '', unit: 'kg' })
      setShowPriceForm(false)
    }
  }

  const handleDeletePrice = (itemName: string): void => {
    const key = itemName.toLowerCase()
    const newPrices = { ...itemPrices }
    delete newPrices[key]
    setItemPrices(newPrices)
  }

  const handleRemoveHotelOrder = (orderId: string): void => {
    setOrders(orders.filter(o => o.id !== orderId))
  }

  const handleUpdateAvailability = (itemName: string, status: 'pending' | 'partial' | 'completed' | 'unavailable', note = ''): void => {
    const today = new Date().toISOString().split('T')[0]
    setOrders(orders.map(o => 
      o.date === today && o.itemName === itemName
        ? { ...o, status, dealerNote: note }
        : o
    ))
  }

  const uniqueHotels = [...new Set(aggregatedOrders.flatMap(a => a.hotels.map(h => h.hotelName)))]
  const totalValue = aggregatedOrders.reduce((sum, agg) => sum + (agg.totalQuantity * (agg.price?.amount || 0)), 0)

  let filteredOrders = aggregatedOrders
  if (filterByItem) {
    filteredOrders = aggregatedOrders.filter(a => a.itemName.toLowerCase().includes(filterByItem.toLowerCase()))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Total Items</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{filteredOrders.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Hotels Ordering</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{uniqueHotels.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Pending Items</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {filteredOrders.filter(a => a.hotels.some(h => h.status === 'pending')).length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Total Value</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">💰 Item Prices</h3>
          <button onClick={() => setShowPriceForm(!showPriceForm)} className="btn-secondary pulse-btn">
            {showPriceForm ? '✕ Cancel' : '+ Add Price'}
          </button>
        </div>

        {showPriceForm && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200 slide-in-left">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="text" 
                value={priceFormData.itemName} 
                onChange={(e) => setPriceFormData({...priceFormData, itemName: e.target.value})} 
                placeholder="Item name" 
                className="input-field" 
              />
              <input 
                type="number" 
                value={priceFormData.price} 
                onChange={(e) => setPriceFormData({...priceFormData, price: e.target.value})} 
                placeholder="Price" 
                className="input-field" 
                min="0" 
                step="0.5" 
              />
              <select 
                value={priceFormData.unit} 
                onChange={(e) => setPriceFormData({...priceFormData, unit: e.target.value})} 
                className="input-field"
              >
                <option value="kg">Per kg</option>
                <option value="piece">Per piece</option>
                <option value="dozen">Per dozen</option>
              </select>
              <button onClick={handleAddPrice} className="btn-primary pulse-btn">
                Add Price
              </button>
            </div>
          </div>
        )}

        {Object.keys(itemPrices).length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="table-header">Item</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Unit</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(itemPrices).map(([key, pd]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="table-cell font-semibold capitalize">{key}</td>
                    <td className="table-cell">₹{pd.amount.toFixed(2)}</td>
                    <td className="table-cell">{pd.unit}</td>
                    <td className="table-cell">
                      <button 
                        onClick={() => handleDeletePrice(key)} 
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mb-8">
        <input 
          type="text" 
          value={filterByItem} 
          onChange={(e) => setFilterByItem(e.target.value)} 
          placeholder="Search items..." 
          className="input-field" 
        />
      </div>

      <div className="space-y-6">
        {filteredOrders.map((agg, idx) => (
          <div key={idx} className="card fade-in">
            <div className="flex justify-between items-start mb-4 pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold">{agg.itemName}</h3>
                <p className="text-gray-600">Total: {agg.totalQuantity} {agg.unit}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">📦 Orders by Hotel:</h4>
              <div className="space-y-2">
                {agg.hotels.map((hotel, hIdx) => {
                  const total = hotel.quantity * (agg.price?.amount || 0)
                  return (
                    <div key={hIdx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                      <div>
                        <p className="font-semibold">{hotel.hotelName}</p>
                        <p className="text-sm text-gray-600">{hotel.quantity} {agg.unit}</p>
                        {agg.price?.amount > 0 && (
                          <p className="text-green-600 font-semibold">₹{total.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          hotel.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {hotel.status}
                        </span>
                        <button 
                          onClick={() => handleRemoveHotelOrder(hotel.orderId)} 
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold mb-3">Update Status:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleUpdateAvailability(agg.itemName, 'completed', '')} 
                  className="btn-primary text-sm py-2 pulse-btn"
                >
                  ✓ Available
                </button>
                <button 
                  onClick={() => {
                    const note = prompt('Shortage note:')
                    if(note) handleUpdateAvailability(agg.itemName, 'partial', note)
                  }} 
                  className="btn-warning text-sm py-2 bg-yellow-500 hover:bg-yellow-600 pulse-btn"
                >
                  ⚠ Partial
                </button>
                <button 
                  onClick={() => {
                    const note = prompt('Reason:')
                    if(note) handleUpdateAvailability(agg.itemName, 'unavailable', note)
                  }} 
                  className="btn-danger text-sm py-2 pulse-btn"
                >
                  ✕ Not Available
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders for today</p>
        </div>
      )}
    </div>
  )
}

export default DealerDashboard
