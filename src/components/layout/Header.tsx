import { User } from '../../data/mockUsers'

interface HeaderProps {
  user: User
  userType: 'hotel' | 'dealer' | null
  onLogout: () => void
}

function Header({ user, userType, onLogout }: HeaderProps): JSX.Element {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {userType === 'hotel' ? '🏨' : '🚚'} {user.name}
          </h2>
          <p className="text-gray-600 text-sm">
            {userType === 'hotel' ? 'Hotel Owner' : 'Vegetable Dealer'}
          </p>
        </div>
        <button onClick={onLogout} className="btn-danger">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header