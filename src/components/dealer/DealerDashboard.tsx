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

interface DashboardItem {
  itemName: string
  totalQuantity: number
  unit: string
  hotelId: string
}

interface HotelData {
  totalHotels: number
  items: DashboardItem[]
}

interface DashboardResponse {
  date: string
  summary: {
    totalHotels: number
    totalPendingItems: number
    byItem: Record<string, number>
  }
  byHotel: Record<string, HotelData>
}

interface DealerDashboardProps {
  user: User
  orders: Order[]
  setOrders: (orders: Order[]) => void
  itemPrices: ItemPrices
  setItemPrices: (prices: ItemPrices) => void
}

function DealerDashboard({ itemPrices, setItemPrices }: DealerDashboardProps): JSX.Element {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [filterByItem, setFilterByItem] = useState<string>('')
  const [showPriceForm, setShowPriceForm] = useState<boolean>(false)
  const [priceFormData, setPriceFormData] = useState({ itemName: '', price: '', unit: 'kg' })

  useEffect(() => {
    fetch('https://backend-apis-8yam.onrender.com/dealer/dealer/dashboard')
      .then(res => res.json())
      .then(data => {
        setDashboardData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data', err)
        setLoading(false)
      })
  }, [])

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div className="text-center py-12 text-red-600 font-bold text-xl">Failed to load dashboard data.</div>
  }

  // Transform API data for "By Item" view
  const aggregatedItems: Record<string, { totalQuantity: number, unit: string, hotels: { name: string, quantity: number }[] }> = {}
  
  Object.entries(dashboardData.byHotel).forEach(([hotelName, data]) => {
    data.items.forEach(item => {
      if (!aggregatedItems[item.itemName]) {
        aggregatedItems[item.itemName] = {
          totalQuantity: 0,
          unit: item.unit,
          hotels: []
        }
      }
      aggregatedItems[item.itemName].hotels.push({
        name: hotelName,
        quantity: item.totalQuantity
      })
    })
  })

  // Sync totals with summary for accuracy
  Object.keys(aggregatedItems).forEach(key => {
    if (dashboardData.summary.byItem[key]) {
      aggregatedItems[key].totalQuantity = dashboardData.summary.byItem[key]
    }
  })

  let displayItems = Object.entries(aggregatedItems).map(([name, data]) => ({
    itemName: name,
    ...data
  }))

  if (filterByItem) {
    displayItems = displayItems.filter(i => i.itemName.toLowerCase().includes(filterByItem.toLowerCase()))
  }

  const totalValue = displayItems.reduce((sum, item) => {
    const price = itemPrices[item.itemName.toLowerCase()]?.amount || 0
    return sum + (item.totalQuantity * price)
  }, 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dealer Dashboard <span className="text-sm font-normal text-gray-500 ml-2">{dashboardData.date}</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Total Items</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{Object.keys(dashboardData.summary.byItem).length}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Hotels Ordering</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{dashboardData.summary.totalHotels}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-600 text-sm font-semibold">Pending Items</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {dashboardData.summary.totalPendingItems}
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
        {displayItems.map((item, idx) => {
          const unitPrice = itemPrices[item.itemName.toLowerCase()]?.amount || 0
          const itemTotalValue = item.totalQuantity * unitPrice
          
          return (
            <div key={idx} className="card fade-in hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{item.itemName}</h3>
                  <p className="text-gray-500 font-medium mt-1">Total Required: <span className="text-blue-600 text-lg">{item.totalQuantity} {item.unit}</span></p>
                </div>
                {unitPrice > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Est. Value</p>
                    <p className="text-xl font-bold text-green-600">₹{itemTotalValue.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 text-xs">🏨</span> 
                  Hotel Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {item.hotels.map((hotel, hIdx) => (
                    <div key={hIdx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                      <span className="font-medium text-gray-700">{hotel.name}</span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                        {hotel.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {displayItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders for today</p>
        </div>
      )}
    </div>
  )
}

export default DealerDashboard
