import { useState } from 'react'
import { User } from '../../data/mockUsers'

interface OrderItem {
  itemName: string
  quantity: string
  unit: string
  tempId: number
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

interface OrderFormProps {
  user: User
  orders: Order[]
  setOrders: (orders: Order[]) => void
  onClose: () => void
}

function OrderForm({ user, orders, setOrders, onClose }: OrderFormProps): JSX.Element {
  const [itemName, setItemName] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [unit, setUnit] = useState<string>('kg')
  const [items, setItems] = useState<OrderItem[]>([])

  const handleAddItem = (): void => {
    if (itemName && quantity) {
      setItems([...items, { itemName, quantity, unit, tempId: Date.now() }])
      setItemName('')
      setQuantity('')
      setUnit('kg')
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (items.length === 0) return

    const apiPayload = {
      hotelId: user.id,
      hotelName: user.name,
      items: items.map(item => ({
        itemName: item.itemName,
        quantity: parseFloat(item.quantity),
        unit: item.unit
      }))
    }

    try {
      const response = await fetch('https://backend-apis-8yam.onrender.com/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      })

      if (response.ok) {
        const today = new Date().toISOString().split('T')[0]
        const newOrders: Order[] = items.map(item => ({
          id: 'order_' + Date.now() + Math.random(),
          hotelId: user.id,
          hotelName: user.name,
          itemName: item.itemName,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          date: today,
          status: 'pending',
          dealerNote: '',
          timestamp: new Date().toISOString()
        }))

        setOrders([...orders, ...newOrders])
        setItems([])
        onClose()
      }
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200 slide-in-left">
      <h4 className="font-bold text-gray-800 mb-4">Add Vegetable/Fruit Items</h4>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., Tomato"
            className="input-field"
            list="items-list"
          />
          <datalist id="items-list">
            <option value="Tomato" />
            <option value="Potato" />
            <option value="Carrot" />
            <option value="Onion" />
            <option value="Capsicum" />
            <option value="Cucumber" />
            <option value="Apple" />
            <option value="Banana" />
            <option value="Orange" />
          </datalist>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Amount"
            className="input-field"
            min="0.5"
            step="0.5"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-field">
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="piece">piece</option>
            <option value="dozen">dozen</option>
            <option value="box">box</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleAddItem} className="btn-secondary w-full pulse-btn">
            Add
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mb-4">
          <h5 className="font-semibold text-gray-800 mb-3">Items to Add ({items.length}):</h5>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.tempId} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                <span>{item.itemName} - {item.quantity} {item.unit}</span>
                <button
                  onClick={() => setItems(items.filter(i => i.tempId !== item.tempId))}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleSubmit} className="btn-primary flex-1 pulse-btn" disabled={items.length === 0}>
          Submit ({items.length})
        </button>
        <button onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default OrderForm