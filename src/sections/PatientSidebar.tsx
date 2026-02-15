import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  UserCircle, 
  Calendar, 
  MessageSquare, 
  MessageCircle,
  LogOut,
  ChevronRight,
  Shield,
  Users
} from 'lucide-react';

interface PatientSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PatientSidebar({ activeTab, onTabChange }: PatientSidebarProps) {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { id: 'overview', label: 'Omat tiedot', icon: UserCircle },
    { id: 'appointments', label: 'Ajanvaraus', icon: Calendar },
    { id: 'staff', label: 'Henkilökunta', icon: Users },
    { id: 'messages', label: 'Viestit', icon: MessageCircle },
    { id: 'feedback', label: 'Anna palautetta', icon: MessageSquare },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
        isExpanded ? 'w-72' : 'w-20'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066b3] to-[#00a8b3] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="20" viewBox="0 0 28 24" fill="none">
              <path d="M14 0L28 12L14 24L0 12L14 0Z" fill="white"/>
            </svg>
          </div>
          {isExpanded && (
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">OmaKanta</h1>
              <p className="text-xs text-gray-500">Potilasportaali</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {isExpanded && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0066b3] flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-[#0066b3]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name || 'Potilas'}</p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" />
                <p className="text-xs text-green-600">Suojattu yhteys</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-[#0066b3] to-[#00a8b3] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Info */}
      {isExpanded && (
        <div className="absolute bottom-20 left-0 right-0 p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 font-medium">Tärkeää</p>
            <p className="text-xs text-amber-700 mt-1">
              Näet tässä vain omat terveystietosi. Ota yhteyttä henkilökuntaan, jos tarvitset apua.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {isExpanded && 'Kirjaudu ulos'}
        </Button>
        
        {isExpanded && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">HUS Potilasportaali v2.0</p>
            <p className="text-xs text-gray-400">© 2025 HUS</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-1/2 w-6 h-12 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center shadow-md hover:bg-gray-50"
      >
        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
}
