import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useMessages } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PatientStaffDirectoryPage() {
  const { user } = useAuth();
  const { users } = useUsers();
  const { conversations, createConversation } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter staff members
  const staffList = users.filter(u => !u.isPatient && u.role !== 'POTILAS');
  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (staff.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  // Check if conversation exists
  const hasConversation = (staffId: string) => {
    return conversations.some(c => 
      c.participantIds.includes(user?.id || '') && c.participantIds.includes(staffId)
    );
  };

  // Get existing conversation or create new one
  const handleStartChat = (staff: any) => {
    if (!user?.id) return;

    const existingConv = conversations.find(c =>
      c.participantIds.includes(user.id) && c.participantIds.includes(staff.id)
    );

    if (existingConv) {
      toast.success('Keskustelu on jo olemassa');
      return;
    }

    createConversation(
      [user.id, staff.id],
      [user.name, staff.name]
    );

    toast.success(`Keskustelu aloitettu: ${staff.name}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'JYL': return 'bg-purple-100 text-purple-800';
      case 'ERIKOISLÄÄKÄRI': return 'bg-blue-100 text-blue-800';
      case 'LÄÄKÄRI': return 'bg-cyan-100 text-cyan-800';
      case 'HOITAJA': return 'bg-green-100 text-green-800';
      case 'ENSIHOITAJA': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-[#0066b3]" />
            Henkilökunta
          </h1>
          <p className="text-gray-500 mt-1">
            Viestittele henkilökunnan jäsenten kanssa
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Hae henkilökunnan jäsentiä..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Henkilökuntaa ei löytynyt</p>
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <Card key={staff.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    <p className="text-sm text-gray-500">{staff.jobTitle || 'Henkilökunta'}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="mb-3">
                  <Badge className={`${getRoleColor(staff.role)} text-xs`}>
                    {staff.role}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {hasConversation(staff.id) ? (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      size="sm"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Keskustelu olemassa
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-[#0066b3] to-[#00a8b3]" 
                      size="sm"
                      onClick={() => handleStartChat(staff)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Aloita keskustelu
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
