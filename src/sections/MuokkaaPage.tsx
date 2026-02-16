import { useState } from 'react';
import { useTemplates } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { convertHtmlToPdfBlob } from '@/lib/pdfConverter';
import { 
  FileText, 
  Edit2, 
  Save, 
  X,
  Type,
  CheckSquare,
  Circle,
  AlignLeft,
  Calendar,
  Image as ImageIcon,
  Code,
  GripVertical
} from 'lucide-react';
import type { FormField, FieldType, TemplateImage } from '@/types';

export function MuokkaaPage() {
  const { templates, updateTemplate } = useTemplates();
  const { isJYL } = useAuth();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [activeTab, setActiveTab] = useState('visual');

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus muokata lomakepohjia.
        </p>
      </div>
    );
  }

  const handleEdit = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplate(templateId);
      setTemplateName(template.name);
      setTemplateDesc(template.description || '');
      setFields(template.sections[0]?.fields || []);
      setImages(template.images || []);
      setHtmlContent(template.html || '');
      setActiveTab(template.html ? 'html' : 'visual');
    }
  };

  const handleSave = () => {
    if (editingTemplate) {
      (async () => {
        let snapshotDataUrl: string | undefined;
        if (activeTab === 'html' && htmlContent) {
          try {
            const pdfBlob = await convertHtmlToPdfBlob(htmlContent);
            snapshotDataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(pdfBlob);
            });
          } catch (e) {
            console.error('PDF snapshot generation failed:', e);
            snapshotDataUrl = undefined;
          }
        }

        updateTemplate(editingTemplate, {
          name: templateName,
          description: templateDesc,
          sections: [{
            id: 'section-1',
            title: 'Pääosio',
            fields,
          }],
          html: activeTab === 'html' ? htmlContent : undefined,
          snapshotPdf: snapshotDataUrl,
          images,
        });
      })();
      setEditingTemplate(null);
    }
  };

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'text' ? 'Uusi tekstikenttä' : 
             type === 'checkbox' ? 'Valintaruutu' :
             type === 'radio' ? 'Valintanappi' :
             type === 'textarea' ? 'Tekstialue' :
             type === 'date' ? 'Päivämäärä' :
             type === 'signature' ? 'Allekirjoitus' : 'Uusi kenttä',
      placeholder: '',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const handleAddImage = () => {
    const newImage: TemplateImage = {
      id: Math.random().toString(36).substr(2, 9),
      src: '',
      position: 'top-center',
      width: 200,
      height: 100,
    };
    setImages([...images, newImage]);
  };

  const handleUpdateImage = (imageId: string, updates: Partial<TemplateImage>) => {
    setImages(images.map(img => img.id === imageId ? { ...img, ...updates } : img));
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Muokkaa pohjia</h2>
        <p className="text-gray-500">Muokkaa olemassa olevia lomakepohjia</p>
      </div>

      {/* Templates List */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.isDefault ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <FileText className={`w-5 h-5 ${template.isDefault ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </div>
                {template.isDefault && (
                  <Badge variant="secondary" className="bg-blue-200 text-blue-700">Oletus</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleEdit(template.id)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Muokkaa
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Muokkaa pohjaa</DialogTitle>
          </DialogHeader>

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

            <ScrollArea className="max-h-[60vh]">
              <TabsContent value="visual" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Pohjan nimi</Label>
                    <Input 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Kuvaus</Label>
                    <Input 
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                    />
                  </div>

                  {/* Field Toolbar */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Lisää kenttiä:</Label>
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
                      <Button variant="outline" size="sm" onClick={handleAddImage}>
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Kuva
                      </Button>
                    </div>
                  </div>

                  {/* Fields List */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Lomakkeen kentät:</Label>
                    {fields.length === 0 && images.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Ei vielä kenttiä.</p>
                    )}
                    {fields.map((field) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
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

                    {/* Images */}
                    {images.map((image) => (
                      <Card key={image.id} className="bg-amber-50 border-amber-200">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-amber-600" />
                            <div className="flex-1 grid grid-cols-4 gap-2">
                              <Input 
                                value={image.src}
                                onChange={(e) => handleUpdateImage(image.id, { src: e.target.value })}
                                placeholder="Kuvan URL"
                                className="text-sm"
                              />
                              <Select 
                                value={image.position}
                                onValueChange={(v: any) => handleUpdateImage(image.id, { position: v })}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="top-left">Ylhäällä vasen</SelectItem>
                                  <SelectItem value="top-center">Ylhäällä keskellä</SelectItem>
                                  <SelectItem value="top-right">Ylhäällä oikea</SelectItem>
                                  <SelectItem value="bottom-left">Alhaalla vasen</SelectItem>
                                  <SelectItem value="bottom-center">Alhaalla keskellä</SelectItem>
                                  <SelectItem value="bottom-right">Alhaalla oikea</SelectItem>
                                  <SelectItem value="custom">Mukautettu</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input 
                                type="number"
                                value={image.width}
                                onChange={(e) => handleUpdateImage(image.id, { width: parseInt(e.target.value) })}
                                placeholder="Leveys (px)"
                                className="text-sm"
                              />
                              <Input 
                                type="number"
                                value={image.height}
                                onChange={(e) => handleUpdateImage(image.id, { height: parseInt(e.target.value) })}
                                placeholder="Korkeus (px)"
                                className="text-sm"
                              />
                            </div>
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
                </div>
              </TabsContent>

              <TabsContent value="html" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Pohjan nimi</Label>
                    <Input 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Kuvaus</Label>
                    <Input 
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>HTML-sisältö</Label>
                    <Textarea 
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<!DOCTYPE html>..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Peruuta
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Tallenna muutokset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
