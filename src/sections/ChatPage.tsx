import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Edit2, Trash2, Reply } from 'lucide-react';

export function ChatPage() {
  const { user } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, getRecentMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recentMessages = getRecentMessages(100);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentMessages]);

  const handleSend = () => {
    if (!user || !newMessage.trim()) return;
    
    sendMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: newMessage.trim(),
      replyTo: replyingTo || undefined,
    });
    
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleEdit = (msgId: string, content: string) => {
    setEditingId(msgId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingId) return;
    editMessage(editingId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  const handleReply = (msgId: string) => {
    setReplyingTo(msgId);
    inputRef.current?.focus();
  };

  const getReplyMessage = (replyToId: string) => {
    return messages.find(m => m.id === replyToId);
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Keskustelu</h1>
        <p className="text-gray-500 mt-1">Reaaliaikainen keskustelu henkilökunnan kesken</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-[#0066b3]" />
              Yleinen keskustelu
            </CardTitle>
            <Badge variant="outline">{recentMessages.length} viestiä</Badge>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                  {/* Reply reference */}
                  {msg.replyTo && (
                    <div className="mb-1 px-3 py-1 bg-gray-100 rounded text-xs text-gray-500 border-l-2 border-gray-300">
                      {getReplyMessage(msg.replyTo)?.content.substring(0, 50)}...
                    </div>
                  )}
                  
                  <div
                    className={`p-3 rounded-lg ${
                      msg.senderId === user?.id
                        ? 'bg-[#0066b3] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className={`text-xs ${getRoleColor(msg.senderRole)}`}>
                          {msg.senderName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{msg.senderName}</span>
                      <Badge className={`text-xs ${getRoleColor(msg.senderRole)}`}>
                        {msg.senderRole}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    {editingId === msg.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="text-sm"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveEdit}>Tallenna</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Peruuta</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {new Date(msg.sentAt).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                        {msg.isEdited && ' (muokattu)'}
                      </span>
                      
                      {msg.senderId === user?.id && !editingId && (
                        <div className="flex space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => handleEdit(msg.id, msg.content)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => deleteMessage(msg.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Reply button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs mt-1"
                    onClick={() => handleReply(msg.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Vastaa
                  </Button>
                </div>
              </div>
            ))}
            
            {recentMessages.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Ei viestejä vielä. Aloita keskustelu!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Vastataan: {getReplyMessage(replyingTo)?.content.substring(0, 40)}...
            </span>
            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Peruuta</Button>
          </div>
        )}
        
        {/* Input area */}
        <CardContent className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              placeholder="Kirjoita viesti..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-[#0066b3] hover:bg-[#005291]">
              <Send className="w-4 h-4 mr-2" />
              Lähetä
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}