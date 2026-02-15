import { useAuth } from '@/hooks/useAuth';
import { useShiftStatus } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save,
  Plus,
  Archive,
  FileText,
  Edit3,
  Pill,
  Users,
  LogOut,
  ChevronRight,
  BookOpen,
  ClipboardList,
  CalendarClock,
  Circle,
  CheckCircle2,
  Clock,
  UserCircle,
  MessageSquare,
  StickyNote,
  Settings,
  Stethoscope,
  FlaskConical,
  Scan,
  Send,
  Calendar,
  UserCog,
  Hospital,
  FolderOpen,
  Briefcase,
  HeartPulse,
  Clock3,
  FileBarChart,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  requiredPermission?: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  icon?: React.ElementType;
  items: NavItem[];
  requiresJYL?: boolean;
}

// Well-organized navigation groups
const navGroups: NavGroup[] = [
  {
    title: 'Lomakkeet',
    icon: FolderOpen,
    items: [
      { id: 'tallennetut', label: 'Tallennetut', icon: Save },
      { id: 'uusi', label: 'Uusi arviointi', icon: Plus },
      { id: 'arkistoidut', label: 'Arkistoidut', icon: Archive },
    ]
  },
  {
    title: 'Potilashoito',
    icon: HeartPulse,
    items: [
      { id: 'potilaat', label: 'Potilasrekisteri', icon: UserCircle },
      { id: 'diagnoosit', label: 'Diagnoosit', icon: Stethoscope },
      { id: 'reseptit', label: 'Reseptit', icon: Pill },
      { id: 'labra', label: 'Laboratorio', icon: FlaskConical },
      { id: 'kuvantaminen', label: 'Kuvantaminen', icon: Scan },
      { id: 'lahetteet', label: 'Lähetteet', icon: Send },
    ]
  },
  {
    title: 'Ajanhallinta',
    icon: Clock3,
    items: [
      { id: 'ajanvaraus', label: 'Ajanvaraus', icon: Calendar },
      { id: 'vuorot', label: 'Vuorot & Saatavuus', icon: CalendarClock },
    ]
  },
  {
    title: 'Viestintä',
    icon: MessageSquare,
    items: [
      { id: 'chat', label: 'Keskustelu', icon: MessageSquare },
      { id: 'viestit', label: 'Yksityisviestit', icon: MessageSquare },
      { id: 'palautteet', label: 'Potilaspalautteet', icon: BookOpen },
      { id: 'muistiot', label: 'Muistiot', icon: StickyNote },
      { id: 'ohjeistukset', label: 'Ohjeistukset', icon: BookOpen },
    ]
  },
  {
    title: 'Raportointi',
    icon: FileBarChart,
    items: [
      { id: 'raportit', label: 'Raportit', icon: ClipboardList },
      { id: 'potilasportaali', label: 'Potilasportaali', icon: Hospital },
    ]
  },
  {
    title: 'Hallinta',
    icon: Briefcase,
    requiresJYL: true,
    items: [
      { id: 'pohjat', label: 'Lomakepohjat', icon: FileText },
      { id: 'muokkaa', label: 'Muokkaa pohjia', icon: Edit3 },
      { id: 'kayttajat', label: 'Käyttäjähallinta', icon: Users },
      { id: 'henkilokunnan-tunnukset', label: 'Henkilökunnan tunnukset', icon: Users },
      { id: 'ryhmat', label: 'Käyttäjäryhmät', icon: UserCog },
      { id: 'laakkeet', label: 'Lääkkeet', icon: Pill },
    ]
  },
  {
    title: 'Järjestelmä',
    icon: Settings,
    requiresJYL: true,
    items: [
      { id: 'asetukset', label: 'Asetukset', icon: Settings },
      { id: 'lokit', label: 'Toimintaloki', icon: Activity },
    ]
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout, isJYL, canAccessPage, getShiftStatus } = useAuth();
  const { getOnDutyUsers } = useShiftStatus();
  const shiftStatus = getShiftStatus();
  const onDutyUsers = getOnDutyUsers();

  const canAccess = (item: NavItem): boolean => {
    if (isJYL) return true;
    return canAccessPage(item.id);
  };

  // Calculate account expiration
  const getExpirationText = () => {
    if (isJYL) return { text: 'Ei vanhene', color: 'text-green-600' };
    if (!user?.expiresAt) return { text: 'Ei vanhene', color: 'text-green-600' };
    
    const expires = new Date(user.expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: 'Vanhentunut', color: 'text-red-600' };
    if (daysLeft <= 7) return { text: `${daysLeft} pv`, color: 'text-red-600' };
    if (daysLeft <= 30) return { text: `${daysLeft} pv`, color: 'text-yellow-600' };
    return { text: `${daysLeft} pv`, color: 'text-green-600' };
  };

  const expiration = getExpirationText();

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 shadow-xl z-50">
      {/* Header with HUS Logo */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#0066b3]/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl font-bold text-[#0066b3]">HUS</span>
            <div className="absolute -top-0.5 -right-2.5">
              <svg width="14" height="12" viewBox="0 0 28 24" fill="none" className="text-[#00a8b3]">
                <path d="M14 0L28 12L14 24L0 12L14 0Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-[10px] text-gray-500 leading-tight">Helsingin</p>
            <p className="text-[10px] text-gray-500 leading-tight">yliopistollinen</p>
            <p className="text-[10px] text-gray-500 leading-tight">sairaala</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00a8b3] animate-pulse" />
          <span className="text-[10px] text-gray-400">.ruudun luoma HUS järjestelmä</span>
        </div>
      </div>

      {/* User info with shift status and expiration */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066b3] to-[#00a8b3] flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.jobTitle || (user?.role === 'JYL' ? 'Johtava ylilääkäri' : 'Lääkäri')}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={() => {
                  // This would need to be connected to auth context
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  shiftStatus.isOnDuty 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {shiftStatus.isOnDuty ? (
                  <><CheckCircle2 className="w-3 h-3" /> Vuorossa</>
                ) : (
                  <><Circle className="w-3 h-3" /> Ei vuorossa</>
                )}
              </button>
              {/* Account expiration badge */}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 ${expiration.color}`} title="Tilin voimassaoloaika">
                {expiration.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-280px)] sidebar-scroll-area" type="always">
        <div className="p-3 space-y-4 pb-20">
          {navGroups.map((group, groupIndex) => {
            // Skip JYL-only groups for non-JYL users
            if (group.requiresJYL && !isJYL) return null;
            
            // Filter items based on permissions
            const accessibleItems = group.items.filter(item => canAccess(item));
            if (accessibleItems.length === 0) return null;
            
            const GroupIcon = group.icon;
            
            return (
              <div key={group.title}>
                {groupIndex > 0 && <Separator className="bg-gray-100 mb-3" />}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
                  {GroupIcon && <GroupIcon className="w-3.5 h-3.5" />}
                  {group.title}
                </p>
                <nav className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#0066b3] to-[#00a8b3] text-white shadow-md shadow-[#0066b3]/20'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-1.5 py-0">
                            {item.badge}
                          </Badge>
                        )}
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            );
          })}

          {/* On Duty Users */}
          {onDutyUsers.length > 0 && (
            <>
              <Separator className="bg-gray-100 mb-3" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Vuorossa ({onDutyUsers.length})
                </p>
                <div className="px-3 space-y-1">
                  {onDutyUsers.slice(0, 5).map((u) => (
                    <div key={u.userId} className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-600 truncate">{u.userName}</span>
                      <span className="text-[10px] text-gray-400">{u.jobTitle}</span>
                    </div>
                  ))}
                  {onDutyUsers.length > 5 && (
                    <p className="text-[10px] text-gray-400 pl-4">+{onDutyUsers.length - 5} muuta</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Kirjaudu ulos</span>
        </Button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          v2.0 | .ruutu platform
        </p>
      </div>
    </div>
  );
}
