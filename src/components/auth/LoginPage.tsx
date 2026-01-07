import { useState } from 'react'
import MOCK_USERS, { User } from '../../data/mockUsers'

interface LoginPageProps {
  setCurrentUser: (user: User) => void
  setUserType: (type: 'hotel' | 'dealer') => void
}

function LoginPage({ setCurrentUser, setUserType }: LoginPageProps): JSX.Element {
  const [loginType, setLoginType] = useState<'hotel' | 'dealer'>('hotel')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setError('')

    const users = loginType === 'hotel' ? MOCK_USERS.hotels : MOCK_USERS.dealers
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      setCurrentUser(user)
      setUserType(loginType)
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="card w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🥬 Supply Manager</h1>
          <p className="text-gray-600 mt-2">Professional Hotel & Vegetable Management</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setLoginType('hotel')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              loginType === 'hotel'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🏨 Hotel Owner
          </button>
          <button
            onClick={() => setLoginType('dealer')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              loginType === 'dealer'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚚 Dealer
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full pulse-btn">
            Login
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-2">Demo Credentials:</p>
          <div className="text-blue-800 space-y-2">
            {loginType === 'hotel' ? (
              <>
                <p>📧 <strong>grand@hotel.com</strong> / hotel123</p>
                <p>📧 <strong>taj@hotel.com</strong> / taj123</p>
                <p>📧 <strong>palace@hotel.com</strong> / palace123</p>
              </>
            ) : (
              <>
                <p>📧 <strong>fresh@dealer.com</strong> / dealer123</p>
                <p>📧 <strong>premium@dealer.com</strong> / premium123</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage