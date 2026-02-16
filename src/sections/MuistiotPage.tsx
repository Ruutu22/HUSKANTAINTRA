import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSharedNotes } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit2, Trash2, Pin, PinOff, StickyNote, Calendar, User } from 'lucide-react';
import type { SharedNote } from '@/types';

const NOTE_COLORS = [
  { name: 'Valkoinen', value: 'bg-white' },
  { name: 'Keltainen', value: 'bg-yellow-100' },
  { name: 'Vihreä', value: 'bg-green-100' },
  { name: 'Sininen', value: 'bg-blue-100' },
  { name: 'Pinkki', value: 'bg-pink-100' },
  { name: 'Oranssi', value: 'bg-orange-100' },
];

const ROLES = [
  { value: 'JYL', label: 'Johtava ylilääkäri' },
  { value: 'ERIKOISLÄÄKÄRI', label: 'Erikoislääkäri' },
  { value: 'LÄÄKÄRI', label: 'Lääkäri' },
  { value: 'HOITAJA', label: 'Hoitaja' },
  { value: 'ENSIHOITAJA', label: 'Ensihoitaja' },
];

export function MuistiotPage() {
  const { user, isJYL } = useAuth();
  const { addNote, updateNote, deleteNote, getVisibleNotes, getPinnedNotes } = useSharedNotes();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SharedNote | null>(null);
  
  const [newNote, setNewNote] = useState<Partial<SharedNote>>({
    title: '',
    content: '',
    color: 'bg-white',
    isPinned: false,
    visibleToRoles: [],
  });
  const visibleNotes = user ? getVisibleNotes(user.role, isJYL, user.id) : [];
  const pinnedNotes = user ? getPinnedNotes(user.role, isJYL, user.id) : [];
  const unpinnedNotes = visibleNotes.filter(n => !n.isPinned);

  const handleAddNote = () => {
    if (!user || !newNote.title || !newNote.content) return;
    
    addNote({
      title: newNote.title,
      content: newNote.content,
      createdBy: user.id,
      createdByName: user.name,
      isPinned: newNote.isPinned || false,
      color: newNote.color || 'bg-white',
      visibleToRoles: newNote.visibleToRoles || [],
      visibleToPatient: newNote.visibleToPatient !== undefined ? newNote.visibleToPatient : true,
      confidential: newNote.confidential || false,
    });

    setNewNote({
      title: '',
      content: '',
      color: 'bg-white',
      isPinned: false,
      visibleToRoles: [],
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateNote = () => {
    if (!user || !selectedNote) return;
    
    updateNote(
      selectedNote.id,
      {
        title: selectedNote.title,
        content: selectedNote.content,
        color: selectedNote.color,
        isPinned: selectedNote.isPinned,
        visibleToRoles: selectedNote.visibleToRoles,
        visibleToPatient: selectedNote.visibleToPatient !== undefined ? selectedNote.visibleToPatient : true,
        confidential: selectedNote.confidential || false,
      },
      user.id,
      user.name
    );

    setIsEditDialogOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän muistion?')) return;
    deleteNote(noteId);
  };

  const handleTogglePin = (note: SharedNote) => {
    if (!user) return;
    updateNote(
      note.id,
      { isPinned: !note.isPinned },
      user.id,
      user.name
    );
  };

  const canEdit = (note: SharedNote) => {
    if (isJYL) return true;
    return note.createdBy === user?.id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yhteiset muistiot</h1>
          <p className="text-gray-500 mt-1">Jaetut muistiinpanot koko henkilökunnalle</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0066b3] hover:bg-[#005291]">
              <Plus className="w-4 h-4 mr-2" />
              Uusi muistio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Luo uusi muistio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Otsikko</Label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Muistion otsikko"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!newNote.visibleToPatient}
                    onChange={(e) => setNewNote({ ...newNote, visibleToPatient: e.target.checked })}
                  />
                  <span>Näkyy potilaalle</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!newNote.confidential}
                    onChange={(e) => setNewNote({ ...newNote, confidential: e.target.checked })}
                  />
                  <span>Salassa pidettävä (näkyy potilaalle ja kirjanneelle)</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label>Sisältö</Label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Kirjoita sisältö..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Väri</Label>
                  <Select
                    value={newNote.color}
                    onValueChange={(value) => setNewNote({ ...newNote, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded mr-2 ${color.value}`} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Näkyvyys</Label>
                  <Select
                    value={newNote.visibleToRoles?.length === 0 ? 'all' : 'selected'}
                    onValueChange={(value) => setNewNote({ ...newNote, visibleToRoles: value === 'all' ? [] : ['JYL'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Kaikki</SelectItem>
                      <SelectItem value="selected">Valitut roolit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newNote.visibleToRoles && newNote.visibleToRoles.length > 0 && (
                <div className="space-y-2">
                  <Label>Näkyy rooleille</Label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <label key={role.value} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={newNote.visibleToRoles?.includes(role.value)}
                          onChange={(e) => {
                            const roles = newNote.visibleToRoles || [];
                            if (e.target.checked) {
                              setNewNote({ ...newNote, visibleToRoles: [...roles, role.value] });
                            } else {
                              setNewNote({ ...newNote, visibleToRoles: roles.filter(r => r !== role.value) });
                            }
                          }}
                        />
                        <span className="text-sm">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newNote.isPinned}
                  onChange={(e) => setNewNote({ ...newNote, isPinned: e.target.checked })}
                />
                <span>Kiinnitä ylös</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Peruuta</Button>
              <Button onClick={handleAddNote} className="bg-[#0066b3] hover:bg-[#005291]">Tallenna</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center">
            <Pin className="w-5 h-5 mr-2 text-[#0066b3]" />
            Kiinnitetyt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => { setSelectedNote(note); setIsEditDialogOpen(true); }}
                onDelete={() => handleDeleteNote(note.id)}
                onTogglePin={() => handleTogglePin(note)}
                canEdit={canEdit(note)}
              />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* All Notes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Kaikki muistiot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unpinnedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => { setSelectedNote(note); setIsEditDialogOpen(true); }}
              onDelete={() => handleDeleteNote(note.id)}
              onTogglePin={() => handleTogglePin(note)}
              canEdit={canEdit(note)}
            />
          ))}
        </div>
        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Ei muistioita vielä</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Muokkaa muistiota</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!selectedNote.visibleToPatient}
                    onChange={(e) => setSelectedNote({ ...selectedNote, visibleToPatient: e.target.checked })}
                  />
                  <span>Näkyy potilaalle</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!selectedNote.confidential}
                    onChange={(e) => setSelectedNote({ ...selectedNote, confidential: e.target.checked })}
                  />
                  <span>Salassa pidettävä (näkyy potilaalle ja kirjanneelle)</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label>Otsikko</Label>
                <Input
                  value={selectedNote.title}
                  onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sisältö</Label>
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Väri</Label>
                <Select
                  value={selectedNote.color}
                  onValueChange={(value) => setSelectedNote({ ...selectedNote, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-2 ${color.value}`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Peruuta</Button>
            <Button onClick={handleUpdateNote} className="bg-[#0066b3] hover:bg-[#005291]">Tallenna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onTogglePin, canEdit }: { 
  note: SharedNote; 
  onEdit: () => void; 
  onDelete: () => void; 
  onTogglePin: () => void;
  canEdit: boolean;
}) {
  return (
    <Card className={`${note.color} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{note.title}</CardTitle>
          <div className="flex space-x-1">
            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={onTogglePin}>
              {note.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </Button>
            {canEdit && (
              <>
                <Button size="icon" variant="ghost" className="w-7 h-7" onClick={onEdit}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="w-7 h-7" onClick={onDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            {note.createdByName}
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(note.updatedAt).toLocaleDateString('fi-FI')}
          </div>
        </div>
        {note.visibleToRoles && note.visibleToRoles.length > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Rajoitettu näkyvyys</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}