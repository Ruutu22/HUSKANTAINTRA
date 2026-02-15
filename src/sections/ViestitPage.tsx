import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatients, useUsers, useAuditLogs, useMessages } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Send, 
  User, 
  Search,
  Clock,
  Check,
  CheckCheck,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { toast } from 'sonner';

export function ViestitPage() {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { users } = useUsers();
  const { addLog } = useAuditLogs();
  const { messages, conversations, createConversation, sendMessage, markAsRead } = useMessages();

  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  // Get messages for active conversation
  const getConversationMessages = () => {
    if (!activeConversation) return [];
    return messages
      .filter(m => m.conversationId === activeConversation)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  // Get conversations for current user
  const getUserConversations = () => {
    if (!user) return [];
    return conversations.filter(c => 
      c.participantIds.includes(user.id)
    );
  };

  // Get active conversation details
  const getActiveConversationDetails = () => {
    return getUserConversations().find(c => c.id === activeConversation);
  };

  // Filter conversations
  const filteredConversations = getUserConversations().filter(c =>
    c.participantNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get available participants (patients for staff, staff for patients)
  const getAvailableParticipants = () => {
    if (!user) return [];
    
    // If user is patient, show staff members
    if (user.isPatient || user.role === 'POTILAS') {
      return users.filter(u => !u.isPatient && u.role !== 'POTILAS');
    }
    
    // If user is staff, show patients
    return patients;
  };

  const availableParticipants = getAvailableParticipants();
  const filteredParticipants = searchQuery 
    ? availableParticipants.filter((p: any) => 
        `${p.firstName || ''} ${p.lastName || ''} ${p.name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableParticipants;

  const handleStartConversation = () => {
    if (!selectedParticipant || !user) return;

    const conversationId = createConversation(
      [user.id, selectedParticipant.id],
      [user.name, selectedParticipant.firstName 
        ? `${selectedParticipant.firstName} ${selectedParticipant.lastName}`
        : selectedParticipant.name]
    );
    
    setActiveConversation(conversationId);
    setIsNewConversationOpen(false);
    setSelectedParticipant(null);
    
    toast.success('Keskustelu aloitettu');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    sendMessage({
      conversationId: activeConversation,
      senderId: user.id,
      senderName: user.name || 'Käyttäjä',
      senderRole: user.isPatient ? 'patient' : 'staff',
      recipientId: '', // Will be set by hook
      recipientName: '', // Will be set by hook
      content: newMessage.trim(),
    });

    // Add audit log
    addLog({
      userId: user.id,
      userName: user.name || 'Käyttäjä',
      userRole: user.role,
      action: 'chat_message',
      targetName: 'Yksityisviesti',
      details: `Viesti lähetetty`,
    });

    setNewMessage('');
    toast.success('Viesti lähetetty');
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    // Mark all messages in conversation as read
    getConversationMessages().forEach(m => {
      if (!m.isRead && m.recipientId === user?.id) {
        markAsRead(m.id);
      }
    });
  };

  const conversationMessages = getConversationMessages();
  const activeConversationDetails = getActiveConversationDetails();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-[#0066b3]" />
            Yksityisviestit
          </h1>
          <p className="text-gray-500 mt-1">
            Viestittele potilaiden tai henkilökunnan kanssa
          </p>
        </div>
        <Button 
          onClick={() => setIsNewConversationOpen(true)}
          className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Uusi keskustelu
        </Button>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Hae keskusteluja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="h-[520px]">
              <div className="divide-y">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Ei keskusteluja</p>
                    <p className="text-sm text-gray-400">Aloita uusi keskustelu</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        activeConversation === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conversation.participantNames
                                .filter(name => name !== user?.name)
                                .join(', ')}
                            </p>
                            {messages.filter(m => 
                              m.conversationId === conversation.id && 
                              !m.isRead && 
                              m.recipientId === user?.id
                            ).length > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {messages.filter(m => 
                                  m.conversationId === conversation.id && 
                                  !m.isRead && 
                                  m.recipientId === user?.id
                                ).length}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage || 'Ei viestejä'}
                          </p>
                          {conversation.lastMessageAt && (
                            <p className="text-xs text-gray-400">
                              {format(new Date(conversation.lastMessageAt), 'dd.MM. HH:mm', { locale: fi })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {activeConversationDetails?.participantNames
                        .filter(name => name !== user?.name)
                        .join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {conversationMessages.length} viestiä
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveConversation(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Ei viestejä vielä</p>
                      <p className="text-sm text-gray-400">Kirjoita ensimmäinen viesti</p>
                    </div>
                  ) : (
                    conversationMessages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? 'bg-gradient-to-r from-[#0066b3] to-[#00a8b3] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {format(new Date(message.createdAt), 'HH:mm', { locale: fi })}
                              {isOwn && (
                                message.isRead ? (
                                  <CheckCheck className="w-3 h-3 ml-1" />
                                ) : (
                                  <Check className="w-3 h-3 ml-1" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Kirjoita viesti..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Valitse keskustelu</p>
                <p className="text-sm text-gray-400">tai aloita uusi</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi keskustelu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Hae..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredParticipants.map((participant: any) => (
                <div
                  key={participant.id}
                  onClick={() => setSelectedParticipant(participant)}
                  className={`p-3 rounded-lg cursor-pointer border ${
                    selectedParticipant?.id === participant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {participant.firstName 
                          ? `${participant.firstName} ${participant.lastName}`
                          : participant.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {participant.role || participant.occupation || 'Potilas'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsNewConversationOpen(false)} className="flex-1">
              Peruuta
            </Button>
            <Button 
              onClick={handleStartConversation}
              disabled={!selectedParticipant}
              className="flex-1 bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Aloita
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
