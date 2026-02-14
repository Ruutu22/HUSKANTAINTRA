import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserGroups, useUsers } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, UserPlus, UserMinus, Trash2, MessageSquare } from 'lucide-react';

const GROUP_COLORS = [
  { name: 'Sininen', value: 'bg-blue-100 text-blue-800 border-blue-300' },
  { name: 'Vihreä', value: 'bg-green-100 text-green-800 border-green-300' },
  { name: 'Punainen', value: 'bg-red-100 text-red-800 border-red-300' },
  { name: 'Keltainen', value: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { name: 'Violetti', value: 'bg-purple-100 text-purple-800 border-purple-300' },
  { name: 'Oranssi', value: 'bg-orange-100 text-orange-800 border-orange-300' },
];

export function RyhmatPage() {
  const { user, isJYL } = useAuth();
  const { groups, createGroup, deleteGroup, addMember, removeMember } = useUserGroups();
  const { activeUsers } = useUsers();

  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0].value);
  const [memberSearch, setMemberSearch] = useState('');

  const handleCreateGroup = () => {
    if (!user || !newGroupName.trim()) return;

    createGroup({
      name: newGroupName,
      description: newGroupDescription,
      members: [user.id],
      createdBy: user.id,
      color: selectedColor,
    });

    setIsNewGroupOpen(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedColor(GROUP_COLORS[0].value);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän ryhmän?')) return;
    deleteGroup(groupId);
  };

  const handleAddMember = (groupId: string, userId: string) => {
    addMember(groupId, userId);
  };

  const handleRemoveMember = (groupId: string, userId: string) => {
    removeMember(groupId, userId);
  };

  const getMemberCount = (memberIds: string[]) => {
    return memberIds.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Käyttäjäryhmät</h1>
          <p className="text-gray-500 mt-1">Luo ja hallinnoi tiimejä</p>
        </div>
        <Button onClick={() => setIsNewGroupOpen(true)} className="bg-[#0066b3] hover:bg-[#005291]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi ryhmä
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${group.color?.split(' ')[0] || 'bg-gray-100'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge className={group.color || 'bg-gray-100'}>
                      {getMemberCount(group.members)} jäsentä
                    </Badge>
                  </div>
                </div>
                {isJYL && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {group.description && (
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              )}
              
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Jäsenet:</p>
                <div className="flex flex-wrap gap-1">
                  {group.members.slice(0, 5).map((memberId) => {
                    const member = activeUsers.find(u => u.id === memberId);
                    return member ? (
                      <Badge key={memberId} variant="outline" className="text-xs">
                        {member.name}
                      </Badge>
                    ) : null;
                  })}
                  {group.members.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.members.length - 5}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedGroup(group);
                    setIsManageMembersOpen(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Hallinnoi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Viesti
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Ei ryhmiä vielä</p>
            <p className="text-sm text-gray-400">Luo uusi ryhmä aloittaaksesi</p>
          </CardContent>
        </Card>
      )}

      {/* New Group Dialog */}
      <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Uusi käyttäjäryhmä</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Ryhmän nimi</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Esim. Päivystysryhmä A"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Kuvaus</Label>
              <textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Ryhmän kuvaus..."
                className="w-full p-2 border rounded-md mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label>Väri</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`px-3 py-2 rounded-lg text-sm ${color.value} ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewGroupOpen(false)}>Peruuta</Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="bg-[#0066b3] hover:bg-[#005291]"
            >
              Luo ryhmä
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Hallinnoi jäseniä: {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Hae käyttäjiä..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {activeUsers
                  .filter(u => 
                    memberSearch === '' || 
                    u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    u.jobTitle?.toLowerCase().includes(memberSearch.toLowerCase())
                  )
                  .map((userItem) => {
                    const isMember = selectedGroup?.members.includes(userItem.id);
                    return (
                      <div
                        key={userItem.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0066b3] flex items-center justify-center text-white font-semibold">
                            {userItem.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{userItem.name}</p>
                            <p className="text-sm text-gray-500">{userItem.jobTitle || userItem.role}</p>
                          </div>
                        </div>
                        {isMember ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(selectedGroup.id, userItem.id)}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Poista
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddMember(selectedGroup.id, userItem.id)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Lisää
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
