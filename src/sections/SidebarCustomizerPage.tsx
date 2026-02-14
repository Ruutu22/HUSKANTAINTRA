import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Layout,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  FileJson
} from 'lucide-react';
import type { UserRole } from '@/types';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  tabId: string;
  visibleToRoles: UserRole[];
  visibleToJobTitles: string[];
  order: number;
  isVisible: boolean;
  groupId: string;
}

interface SidebarGroup {
  id: string;
  label: string;
  icon: string;
  order: number;
  isVisible: boolean;
  visibleToRoles: UserRole[];
  items: string[];
}

const DEFAULT_GROUPS: SidebarGroup[] = [
  { id: 'forms', label: 'Lomakkeet', icon: 'FolderOpen', order: 1, isVisible: true, visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], items: [] },
  { id: 'patientcare', label: 'Potilashoito', icon: 'HeartPulse', order: 2, isVisible: true, visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], items: [] },
  { id: 'schedule', label: 'Ajanhallinta', icon: 'Clock3', order: 3, isVisible: true, visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], items: [] },
  { id: 'communication', label: 'Viestintä', icon: 'MessageSquare', order: 4, isVisible: true, visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], items: [] },
  { id: 'reporting', label: 'Raportointi', icon: 'FileBarChart', order: 5, isVisible: true, visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], items: [] },
  { id: 'admin', label: 'Hallinta', icon: 'Briefcase', order: 6, isVisible: true, visibleToRoles: ['JYL'], items: [] },
  { id: 'system', label: 'Järjestelmä', icon: 'Settings', order: 7, isVisible: true, visibleToRoles: ['JYL'], items: [] },
];

const DEFAULT_ITEMS: SidebarItem[] = [
  { id: 'tallennetut', label: 'Tallennetut', icon: 'Save', tabId: 'tallennetut', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'forms' },
  { id: 'uusi', label: 'Uusi arviointi', icon: 'Plus', tabId: 'uusi', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'forms' },
  { id: 'arkistoidut', label: 'Arkistoidut', icon: 'Archive', tabId: 'arkistoidut', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 3, isVisible: true, groupId: 'forms' },
  { id: 'potilaat', label: 'Potilasrekisteri', icon: 'UserCircle', tabId: 'potilaat', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'patientcare' },
  { id: 'diagnoosit', label: 'Diagnoosit', icon: 'Stethoscope', tabId: 'diagnoosit', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'patientcare' },
  { id: 'reseptit', label: 'Reseptit', icon: 'Pill', tabId: 'reseptit', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 3, isVisible: true, groupId: 'patientcare' },
  { id: 'labra', label: 'Laboratorio', icon: 'FlaskConical', tabId: 'labra', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 4, isVisible: true, groupId: 'patientcare' },
  { id: 'kuvantaminen', label: 'Kuvantaminen', icon: 'Scan', tabId: 'kuvantaminen', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 5, isVisible: true, groupId: 'patientcare' },
  { id: 'lahetteet', label: 'Lähetteet', icon: 'Send', tabId: 'lahetteet', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 6, isVisible: true, groupId: 'patientcare' },
  { id: 'ajanvaraus', label: 'Ajanvaraus', icon: 'Calendar', tabId: 'ajanvaraus', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'schedule' },
  { id: 'vuorot', label: 'Vuorot & Saatavuus', icon: 'CalendarClock', tabId: 'vuorot', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'schedule' },
  { id: 'chat', label: 'Keskustelu', icon: 'MessageSquare', tabId: 'chat', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'communication' },
  { id: 'muistiot', label: 'Muistiot', icon: 'StickyNote', tabId: 'muistiot', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'communication' },
  { id: 'ohjeistukset', label: 'Ohjeistukset', icon: 'BookOpen', tabId: 'ohjeistukset', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], visibleToJobTitles: [], order: 3, isVisible: true, groupId: 'communication' },
  { id: 'raportit', label: 'Raportit', icon: 'ClipboardList', tabId: 'raportit', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'reporting' },
  { id: 'potilasportaali', label: 'Potilasportaali', icon: 'Hospital', tabId: 'potilasportaali', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'reporting' },
  { id: 'pohjat', label: 'Lomakepohjat', icon: 'FileText', tabId: 'pohjat', visibleToRoles: ['JYL'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'admin' },
  { id: 'muokkaa', label: 'Muokkaa pohjia', icon: 'Edit3', tabId: 'muokkaa', visibleToRoles: ['JYL'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'admin' },
  { id: 'kayttajat', label: 'Käyttäjähallinta', icon: 'Users', tabId: 'kayttajat', visibleToRoles: ['JYL'], visibleToJobTitles: [], order: 3, isVisible: true, groupId: 'admin' },
  { id: 'ryhmat', label: 'Käyttäjäryhmät', icon: 'UserCog', tabId: 'ryhmat', visibleToRoles: ['JYL'], visibleToJobTitles: [], order: 4, isVisible: true, groupId: 'admin' },
  { id: 'asetukset', label: 'Asetukset', icon: 'Settings', tabId: 'asetukset', visibleToRoles: ['JYL'], visibleToJobTitles: [], order: 1, isVisible: true, groupId: 'system' },
  { id: 'lokit', label: 'Toimintaloki', icon: 'Activity', tabId: 'lokit', visibleToRoles: ['JYL'], visibleToJobTitles: [], order: 2, isVisible: true, groupId: 'system' },
];

export function SidebarCustomizerPage() {
  const { isJYL } = useAuth();
  const [groups, setGroups] = useState<SidebarGroup[]>(() => {
    const saved = localStorage.getItem('hus_sidebar_groups');
    return saved ? JSON.parse(saved) : DEFAULT_GROUPS;
  });
  const [items, setItems] = useState<SidebarItem[]>(() => {
    const saved = localStorage.getItem('hus_sidebar_items');
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
  });
  
  const [activeTab, setActiveTab] = useState('groups');
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importData, setImportData] = useState('');

  // New group form
  const [newGroup, setNewGroup] = useState({
    label: '',
    icon: 'FolderOpen',
    visibleToRoles: ['JYL'] as UserRole[],
  });

  // New item form
  const [newItem, setNewItem] = useState({
    label: '',
    icon: 'FileText',
    tabId: '',
    groupId: '',
    visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'] as UserRole[],
  });

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Layout className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus muokata sivupalkkia.
        </p>
      </div>
    );
  }

  const saveToStorage = (newGroups: SidebarGroup[], newItems: SidebarItem[]) => {
    localStorage.setItem('hus_sidebar_groups', JSON.stringify(newGroups));
    localStorage.setItem('hus_sidebar_items', JSON.stringify(newItems));
    toast.success('Muutokset tallennettu');
  };

  const handleAddGroup = () => {
    if (!newGroup.label.trim()) return;
    
    const group: SidebarGroup = {
      id: `group-${Date.now()}`,
      label: newGroup.label,
      icon: newGroup.icon,
      order: groups.length + 1,
      isVisible: true,
      visibleToRoles: newGroup.visibleToRoles,
      items: [],
    };
    
    const updatedGroups = [...groups, group];
    setGroups(updatedGroups);
    saveToStorage(updatedGroups, items);
    setNewGroup({ label: '', icon: 'FolderOpen', visibleToRoles: ['JYL'] });
    setIsAddGroupOpen(false);
  };

  const handleAddItem = () => {
    if (!newItem.label.trim() || !newItem.tabId.trim() || !newItem.groupId) return;
    
    const item: SidebarItem = {
      id: `item-${Date.now()}`,
      label: newItem.label,
      icon: newItem.icon,
      tabId: newItem.tabId,
      visibleToRoles: newItem.visibleToRoles,
      visibleToJobTitles: [],
      order: items.filter(i => i.groupId === newItem.groupId).length + 1,
      isVisible: true,
      groupId: newItem.groupId,
    };
    
    const updatedItems = [...items, item];
    setItems(updatedItems);
    saveToStorage(groups, updatedItems);
    setNewItem({ label: '', icon: 'FileText', tabId: '', groupId: '', visibleToRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'] });
    setIsAddItemOpen(false);
  };

  const toggleGroupVisibility = (groupId: string) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, isVisible: !g.isVisible } : g
    );
    setGroups(updatedGroups);
    saveToStorage(updatedGroups, items);
  };

  const toggleItemVisibility = (itemId: string) => {
    const updatedItems = items.map(i => 
      i.id === itemId ? { ...i, isVisible: !i.isVisible } : i
    );
    setItems(updatedItems);
    saveToStorage(groups, updatedItems);
  };

  const moveGroup = (groupId: string, direction: 'up' | 'down') => {
    const index = groups.findIndex(g => g.id === groupId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === groups.length - 1) return;
    
    const newGroups = [...groups];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newGroups[index], newGroups[swapIndex]] = [newGroups[swapIndex], newGroups[index]];
    
    // Update orders
    newGroups.forEach((g, i) => g.order = i + 1);
    
    setGroups(newGroups);
    saveToStorage(newGroups, items);
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) return;
    
    const item = items[index];
    const groupItems = items.filter(i => i.groupId === item.groupId);
    const groupIndex = groupItems.findIndex(i => i.id === itemId);
    
    if (direction === 'up' && groupIndex === 0) return;
    if (direction === 'down' && groupIndex === groupItems.length - 1) return;
    
    const swapItem = groupItems[direction === 'up' ? groupIndex - 1 : groupIndex + 1];
    
    const newItems = [...items];
    const idx1 = newItems.findIndex(i => i.id === itemId);
    const idx2 = newItems.findIndex(i => i.id === swapItem.id);
    
    [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
    
    setItems(newItems);
    saveToStorage(groups, newItems);
  };

  const deleteGroup = (groupId: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän ryhmän?')) return;
    const updatedGroups = groups.filter(g => g.id !== groupId);
    const updatedItems = items.filter(i => i.groupId !== groupId);
    setGroups(updatedGroups);
    setItems(updatedItems);
    saveToStorage(updatedGroups, updatedItems);
  };

  const deleteItem = (itemId: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän kohteen?')) return;
    const updatedItems = items.filter(i => i.id !== itemId);
    setItems(updatedItems);
    saveToStorage(groups, updatedItems);
  };

  const exportConfig = () => {
    const config = { groups, items };
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hus-sidebar-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Konfiguraatio viety');
  };

  const importConfig = () => {
    try {
      const config = JSON.parse(importData);
      if (config.groups && config.items) {
        setGroups(config.groups);
        setItems(config.items);
        saveToStorage(config.groups, config.items);
        setIsImportOpen(false);
        setImportData('');
        toast.success('Konfiguraatio tuotu onnistuneesti');
      } else {
        toast.error('Virheellinen konfiguraatio');
      }
    } catch {
      toast.error('Virheellinen JSON-muoto');
    }
  };

  const resetToDefault = () => {
    if (!confirm('Haluatko palauttaa oletusasetukset? Kaikki muutokset menetetään.')) return;
    setGroups(DEFAULT_GROUPS);
    setItems(DEFAULT_ITEMS);
    saveToStorage(DEFAULT_GROUPS, DEFAULT_ITEMS);
    toast.success('Oletusasetukset palautettu');
  };

  const availableIcons = [
    'Save', 'Plus', 'Archive', 'FileText', 'Edit3', 'Pill', 'Users', 'BookOpen', 
    'ClipboardList', 'CalendarClock', 'Circle', 'CheckCircle2', 'Clock', 'UserCircle',
    'MessageSquare', 'StickyNote', 'Settings', 'Stethoscope', 'FlaskConical', 'Scan',
    'Send', 'Calendar', 'UserCog', 'Hospital', 'FolderOpen', 'Briefcase', 'HeartPulse',
    'Clock3', 'FileBarChart', 'Activity', 'Layout', 'Eye', 'EyeOff', 'Trash2', 'Edit2'
  ];

  const availableRoles: UserRole[] = ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sivupalkin muokkaus</h1>
          <p className="text-gray-500 mt-1">Mukauta sivupalkin rakennetta ja näkyvyyttä</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Vie
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Tuo
          </Button>
          <Button variant="outline" onClick={resetToDefault} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Palauta oletukset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Ryhmät</TabsTrigger>
          <TabsTrigger value="items">Kohteet</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddGroupOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Uusi ryhmä
            </Button>
          </div>

          <div className="grid gap-4">
            {groups.sort((a, b) => a.order - b.order).map((group, index) => (
              <Card key={group.id} className={!group.isVisible ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <div className="w-10 h-10 bg-[#0066b3] rounded-lg flex items-center justify-center text-white">
                        <Layout className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{group.label}</h3>
                        <p className="text-sm text-gray-500">{group.icon}</p>
                        <div className="flex gap-1 mt-1">
                          {group.visibleToRoles.map(role => (
                            <Badge key={role} variant="secondary" className="text-[10px]">{role}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveGroup(group.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveGroup(group.id, 'down')}
                        disabled={index === groups.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleGroupVisibility(group.id)}
                      >
                        {group.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGroup(group.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddItemOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Uusi kohde
            </Button>
          </div>

          {groups.sort((a, b) => a.order - b.order).map(group => {
            const groupItems = items.filter(i => i.groupId === group.id).sort((a, b) => a.order - b.order);
            if (groupItems.length === 0) return null;
            
            return (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {groupItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${!item.isVisible ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{item.label}</span>
                          <Badge variant="outline" className="text-xs">{item.tabId}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={index === groupItems.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleItemVisibility(item.id)}
                          >
                            {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Add Group Dialog */}
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi ryhmä</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nimi</Label>
              <Input 
                value={newGroup.label} 
                onChange={(e) => setNewGroup({ ...newGroup, label: e.target.value })}
                placeholder="Esim. Oma ryhmä"
              />
            </div>
            <div className="space-y-2">
              <Label>Ikoni</Label>
              <Select value={newGroup.icon} onValueChange={(v) => setNewGroup({ ...newGroup, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Näkyvyys rooleille</Label>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center gap-1 text-sm">
                    <Checkbox 
                      checked={newGroup.visibleToRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewGroup({ ...newGroup, visibleToRoles: [...newGroup.visibleToRoles, role] });
                        } else {
                          setNewGroup({ ...newGroup, visibleToRoles: newGroup.visibleToRoles.filter(r => r !== role) });
                        }
                      }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>Peruuta</Button>
            <Button onClick={handleAddGroup} disabled={!newGroup.label.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Tallenna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi kohde</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nimi</Label>
              <Input 
                value={newItem.label} 
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="Esim. Oma sivu"
              />
            </div>
            <div className="space-y-2">
              <Label>Välilehden ID</Label>
              <Input 
                value={newItem.tabId} 
                onChange={(e) => setNewItem({ ...newItem, tabId: e.target.value })}
                placeholder="Esim. oma-sivu"
              />
            </div>
            <div className="space-y-2">
              <Label>Ikoni</Label>
              <Select value={newItem.icon} onValueChange={(v) => setNewItem({ ...newItem, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ryhmä</Label>
              <Select value={newItem.groupId} onValueChange={(v) => setNewItem({ ...newItem, groupId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse ryhmä" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Näkyvyys rooleille</Label>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center gap-1 text-sm">
                    <Checkbox 
                      checked={newItem.visibleToRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewItem({ ...newItem, visibleToRoles: [...newItem.visibleToRoles, role] });
                        } else {
                          setNewItem({ ...newItem, visibleToRoles: newItem.visibleToRoles.filter(r => r !== role) });
                        }
                      }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>Peruuta</Button>
            <Button onClick={handleAddItem} disabled={!newItem.label.trim() || !newItem.tabId.trim() || !newItem.groupId}>
              <Save className="w-4 h-4 mr-2" />
              Tallenna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tuo konfiguraatio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>JSON-data</Label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Liitä JSON-konfiguraatio tähän..."
                className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Peruuta</Button>
            <Button onClick={importConfig} disabled={!importData.trim()}>
              <FileJson className="w-4 h-4 mr-2" />
              Tuo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
