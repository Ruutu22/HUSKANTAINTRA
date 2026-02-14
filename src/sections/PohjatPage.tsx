import React, { useState, useRef, useCallback } from 'react';
import { useTemplates, useJobTitles } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

import { 
  FileText, 
  Plus, 
  Trash2, 
  GripVertical,
  Type,
  CheckSquare,
  Circle,
  AlignLeft,
  Calendar,
  Image as ImageIcon,
  Code,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Users,
  Move
} from 'lucide-react';
import type { FormField, FieldType, TemplateImage } from '@/types';



// Draggable Image Component
function DraggableImage({ 
  image, 
  onUpdate, 
  onRemove,
  containerRef 
}: { 
  image: TemplateImage; 
  onUpdate: (id: string, updates: Partial<TemplateImage>) => void;
  onRemove: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ 
    x: image.customX || 50, 
    y: image.customY || 50 
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width) * 100;
    const newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));
    
    setPosition({ x: clampedX, y: clampedY });
  }, [isDragging, containerRef]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onUpdate(image.id, { 
        customX: position.x, 
        customY: position.y,
        position: 'custom'
      });
    }
  }, [isDragging, position, image.id, onUpdate]);

  // Add global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`absolute cursor-move transition-shadow ${isDragging ? 'z-50 shadow-2xl' : 'z-10'}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: image.width || 200,
        height: image.height || 100,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative group">
        {image.src ? (
          <img 
            src={image.src} 
            alt="Template" 
            className="w-full h-full object-contain border-2 border-dashed border-gray-300 rounded bg-white"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Vedä siirtääksesi
        </div>
      </div>
    </div>
  );
}

export function PohjatPage() {
  const { templates, addTemplate, deleteTemplate, updateTemplate } = useTemplates();
  const { jobTitles } = useJobTitles();
  const { user, isJYL } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [activeTab, setActiveTab] = useState('visual');
  const [selectedCategory, setSelectedCategory] = useState<'tt' | 'psykologi' | 'raportti' | 'vuoro' | 'muu'>('tt');
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [hasApprovalFlow, setHasApprovalFlow] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus luoda uusia lomakepohjia.
        </p>
      </div>
    );
  }

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'text' ? 'Uusi tekstikenttä' : 
             type === 'checkbox' ? 'Valintaruutu' :
             type === 'radio' ? 'Valintanappi' :
             type === 'textarea' ? 'Tekstialue' :
             type === 'date' ? 'Päivämäärä' :
             type === 'signature' ? 'Allekirjoitus' :
             type === 'approval' ? 'Hyväksy-painike' :
             type === 'reject' ? 'Hylkää-painike' : 'Uusi kenttä',
      placeholder: '',
      required: false,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newFields = [...fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    
    // Update order
    newFields.forEach((f, i) => f.order = i);
    setFields(newFields);
  };

  const handleAddImage = () => {
    const newImage: TemplateImage = {
      id: Math.random().toString(36).substr(2, 9),
      src: '',
      position: 'custom',
      customX: 50,
      customY: 50,
      width: 200,
      height: 100,
      isDraggable: true,
    };
    setImages([...images, newImage]);
  };

  const handleUpdateImage = (imageId: string, updates: Partial<TemplateImage>) => {
    setImages(images.map(img => img.id === imageId ? { ...img, ...updates } : img));
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleCreateTemplate = () => {
    if (newTemplateName.trim()) {
      addTemplate({
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim(),
        sections: [{
          id: 'section-1',
          title: 'Pääosio',
          fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0)),
        }],
        createdBy: user?.name || 'JYL',
        html: activeTab === 'html' ? htmlContent : undefined,
        images,
        category: selectedCategory,
        allowedRoles: allowedRoles.length > 0 ? allowedRoles : undefined,
        hasApprovalFlow,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplate(templateId);
      setNewTemplateName(template.name);
      setNewTemplateDesc(template.description || '');
      setFields(template.sections[0]?.fields || []);
      setImages(template.images || []);
      setHtmlContent(template.html || '');
      setSelectedCategory(template.category || 'tt');
      setAllowedRoles(template.allowedRoles || []);
      setHasApprovalFlow(template.hasApprovalFlow || false);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingTemplate) {
      updateTemplate(editingTemplate, {
        name: newTemplateName,
        description: newTemplateDesc,
        sections: [{
          id: 'section-1',
          title: 'Pääosio',
          fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0)),
        }],
        html: activeTab === 'html' ? htmlContent : undefined,
        images,
        category: selectedCategory,
        allowedRoles: allowedRoles.length > 0 ? allowedRoles : undefined,
        hasApprovalFlow,
      });
      setIsEditDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewTemplateName('');
    setNewTemplateDesc('');
    setFields([]);
    setImages([]);
    setHtmlContent('');
    setSelectedCategory('tt');
    setAllowedRoles([]);
    setHasApprovalFlow(false);
    setEditingTemplate(null);
  };

  const customTemplates = templates.filter(t => !t.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lomakepohjat</h2>
          <p className="text-gray-500">Luo ja hallitse lomakepohjia</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi pohja
        </Button>
      </div>

      {/* Default Templates */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Valmiit pohjat</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {templates.filter(t => t.isDefault).map((template) => (
            <Card key={template.id} className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-700">Oletus</Badge>
                </div>
                {template.hasApprovalFlow && (
                  <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Vaatii hyväksynnän
                  </Badge>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Omat pohjat</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {customTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.hasApprovalFlow && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Hyväksyntä
                      </Badge>
                    )}
                    {template.allowedRoles && template.allowedRoles.length > 0 && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        Rajattu käyttö
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      Muokkaa
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Muokkaa pohjaa' : 'Luo uusi lomakepohja'}</DialogTitle>
            <DialogDescription>
              Suunnittele lomake visuaalisesti tai HTML-muodossa
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Left side - Editor */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visual">
                    <Type className="w-4 h-4 mr-2" />
                    Visuaalinen
                  </TabsTrigger>
                  <TabsTrigger value="html">
                    <Code className="w-4 h-4 mr-2" />
                    HTML
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[60vh]">
                  <TabsContent value="visual" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Pohjan nimi</Label>
                        <Input 
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="Esim. Erikoislääkärin arviointi"
                        />
                      </div>
                      <div>
                        <Label>Kuvaus</Label>
                        <Input 
                          value={newTemplateDesc}
                          onChange={(e) => setNewTemplateDesc(e.target.value)}
                          placeholder="Lyhyt kuvaus pohjasta"
                        />
                      </div>

                      <div>
                        <Label>Kategoria</Label>
                        <Select value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tt">Työterveys</SelectItem>
                            <SelectItem value="psykologi">Psykologi</SelectItem>
                            <SelectItem value="raportti">Raportti</SelectItem>
                            <SelectItem value="vuoro">Vuoro</SelectItem>
                            <SelectItem value="muu">Muu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Approval Flow */}
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <input 
                          type="checkbox"
                          id="approvalFlow"
                          checked={hasApprovalFlow}
                          onChange={(e) => setHasApprovalFlow(e.target.checked)}
                          className="rounded border-amber-400"
                        />
                        <div>
                          <Label htmlFor="approvalFlow" className="cursor-pointer font-medium text-amber-800">
                            Vaatii hyväksynnän
                          </Label>
                          <p className="text-xs text-amber-600">
                            Lomake vaat esihenkilön hyväksynnän ennen kuin se näkyy muille
                          </p>
                        </div>
                      </div>

                      {/* Allowed Roles */}
                      <div>
                        <Label className="text-sm font-medium">Kenellä oikeus täyttää</Label>
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                          {jobTitles.map((title) => (
                            <label key={title.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={allowedRoles.includes(title.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAllowedRoles([...allowedRoles, title.id]);
                                  } else {
                                    setAllowedRoles(allowedRoles.filter(id => id !== title.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{title.name}</span>
                            </label>
                          ))}
                          <p className="text-xs text-gray-500 mt-2">
                            Jos et valitse ketään, kaikki voivat täyttää
                          </p>
                        </div>
                      </div>

                      {/* Field Toolbar */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Lisää kenttiä:</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddField('text')}>
                            <Type className="w-4 h-4 mr-1" />
                            Teksti
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('checkbox')}>
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Valintaruutu
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('radio')}>
                            <Circle className="w-4 h-4 mr-1" />
                            Valintanappi
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('textarea')}>
                            <AlignLeft className="w-4 h-4 mr-1" />
                            Tekstialue
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('date')}>
                            <Calendar className="w-4 h-4 mr-1" />
                            Päivämäärä
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('signature')}>
                            <FileText className="w-4 h-4 mr-1" />
                            Allekirjoitus
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('approval')} className="border-green-300 text-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Hyväksy
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddField('reject')} className="border-red-300 text-red-700">
                            <XCircle className="w-4 h-4 mr-1" />
                            Hylkää
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleAddImage}>
                            <ImageIcon className="w-4 h-4 mr-1" />
                            Kuva
                          </Button>
                        </div>
                      </div>

                      {/* Fields List */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Lomakkeen kentät:</Label>
                        {fields.length === 0 && images.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Ei vielä kenttiä. Lisää kenttiä yllä olevista painikkeista.</p>
                        )}
                        {fields.sort((a, b) => (a.order || 0) - (b.order || 0)).map((field, index) => (
                          <Card key={field.id} className="bg-gray-50">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                  <button 
                                    onClick={() => handleMoveField(field.id, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  >
                                    ▲
                                  </button>
                                  <button 
                                    onClick={() => handleMoveField(field.id, 'down')}
                                    disabled={index === fields.length - 1}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  >
                                    ▼
                                  </button>
                                </div>
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                  <Input 
                                    value={field.label}
                                    onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                                    placeholder="Kentän otsikko"
                                    className="text-sm"
                                  />
                                  <Input 
                                    value={field.placeholder || ''}
                                    onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                    placeholder="Ohjeteksti"
                                    className="text-sm"
                                  />
                                  <Select 
                                    value={field.type}
                                    onValueChange={(v) => handleUpdateField(field.id, { type: v as FieldType })}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Teksti</SelectItem>
                                      <SelectItem value="checkbox">Valintaruutu</SelectItem>
                                      <SelectItem value="radio">Valintanappi</SelectItem>
                                      <SelectItem value="textarea">Tekstialue</SelectItem>
                                      <SelectItem value="date">Päivämäärä</SelectItem>
                                      <SelectItem value="signature">Allekirjoitus</SelectItem>
                                      <SelectItem value="approval">Hyväksy</SelectItem>
                                      <SelectItem value="reject">Hylkää</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => handleRemoveField(field.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Images */}
                      {images.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Kuvat (vedä esikatselussa):</Label>
                          {images.map((image) => (
                            <Card key={image.id} className="bg-amber-50 border-amber-200">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-amber-600" />
                                  <Input 
                                    value={image.src}
                                    onChange={(e) => handleUpdateImage(image.id, { src: e.target.value })}
                                    placeholder="Kuvan URL"
                                    className="text-sm flex-1"
                                  />
                                  <Input 
                                    type="number"
                                    value={image.width}
                                    onChange={(e) => handleUpdateImage(image.id, { width: parseInt(e.target.value) || 200 })}
                                    placeholder="Leveys"
                                    className="text-sm w-20"
                                  />
                                  <Input 
                                    type="number"
                                    value={image.height}
                                    onChange={(e) => handleUpdateImage(image.id, { height: parseInt(e.target.value) || 100 })}
                                    placeholder="Korkeus"
                                    className="text-sm w-20"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500"
                                    onClick={() => handleRemoveImage(image.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="html" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Pohjan nimi</Label>
                        <Input 
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="Esim. Erikoislääkärin arviointi"
                        />
                      </div>
                      <div>
                        <Label>HTML-sisältö</Label>
                        <Textarea 
                          value={htmlContent}
                          onChange={(e) => setHtmlContent(e.target.value)}
                          placeholder="<!DOCTYPE html>..."
                          className="min-h-[400px] font-mono text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>

            {/* Right side - Preview */}
            <div className="border rounded-lg bg-gray-50 p-4">
              <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Move className="w-4 h-4" />
                Esikatselu (vedä kuvia)
              </Label>
              <div 
                ref={previewRef}
                className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[500px] overflow-hidden"
              >
                {/* Template preview content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{newTemplateName || 'Uusi lomake'}</h3>
                  <p className="text-sm text-gray-500 mb-4">{newTemplateDesc}</p>
                  
                  {fields.sort((a, b) => (a.order || 0) - (b.order || 0)).map((field) => (
                    <div key={field.id} className="mb-3">
                      <Label className="text-sm">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <div className="h-20 border rounded bg-gray-50 mt-1" />
                      ) : field.type === 'checkbox' ? (
                        <div className="flex gap-2 mt-1">
                          <div className="w-4 h-4 border rounded" />
                          <span className="text-sm text-gray-400">Vaihtoehto</span>
                        </div>
                      ) : field.type === 'approval' ? (
                        <Button size="sm" className="mt-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Hyväksy
                        </Button>
                      ) : field.type === 'reject' ? (
                        <Button size="sm" variant="destructive" className="mt-1">
                          <XCircle className="w-4 h-4 mr-1" />
                          Hylkää
                        </Button>
                      ) : (
                        <div className="h-8 border rounded bg-gray-50 mt-1" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Draggable images */}
                {images.map((image) => (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    onUpdate={handleUpdateImage}
                    onRemove={handleRemoveImage}
                    containerRef={previewRef}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Peruuta
            </Button>
            <Button 
              onClick={isEditDialogOpen ? handleSaveEdit : handleCreateTemplate}
              disabled={!newTemplateName.trim() || (activeTab === 'visual' && fields.length === 0 && images.length === 0)}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditDialogOpen ? 'Tallenna muutokset' : 'Luo pohja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
