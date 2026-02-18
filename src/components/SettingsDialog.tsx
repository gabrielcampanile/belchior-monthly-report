import { useState } from 'react';
import { Settings, Plus, Trash2, Languages, Sun, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const PRESET_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#6b7280', '#14b8a6',
  '#a855f7', '#e11d48', '#84cc16', '#0ea5e9', '#d946ef',
];

interface SettingsDialogProps {
  categories: string[];
  incomeTypes: string[];
  onAddCategory: (name: string, color?: string) => boolean;
  onRemoveCategory: (name: string) => boolean;
  onAddIncomeType: (name: string, color?: string) => boolean;
  onRemoveIncomeType: (name: string) => boolean;
  isDefaultCategory: (name: string) => boolean;
  isDefaultIncomeType: (name: string) => boolean;
  onEditCategory?: (oldName: string, newName: string) => void;
  onEditIncomeType?: (oldName: string, newName: string) => void;
  getCategoryColor?: (name: string) => string;
  getIncomeTypeColor?: (name: string) => string;
  onUpdateCategoryColor?: (name: string, color: string) => void;
  onUpdateIncomeTypeColor?: (name: string, color: string) => void;
}

export function SettingsDialog({
  categories,
  incomeTypes,
  onAddCategory,
  onRemoveCategory,
  onAddIncomeType,
  onRemoveIncomeType,
  isDefaultCategory,
  isDefaultIncomeType,
  onEditCategory,
  onEditIncomeType,
  getCategoryColor,
  getIncomeTypeColor,
  onUpdateCategoryColor,
  onUpdateIncomeTypeColor,
}: SettingsDialogProps) {
  const { language, setLanguage, highContrast, toggleHighContrast, t } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
  const [newIncomeType, setNewIncomeType] = useState('');
  const [newIncomeTypeColor, setNewIncomeTypeColor] = useState(PRESET_COLORS[0]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editingIncomeType, setEditingIncomeType] = useState<string | null>(null);
  const [editIncomeTypeValue, setEditIncomeTypeValue] = useState('');

  const handleAddCategory = () => {
    if (onAddCategory(newCategory, newCategoryColor)) {
      setNewCategory('');
    }
  };

  const handleAddIncomeType = () => {
    if (onAddIncomeType(newIncomeType, newIncomeTypeColor)) {
      setNewIncomeType('');
    }
  };

  const startEditCategory = (name: string) => {
    setEditingCategory(name);
    const displayName = t(`category.${name}`) !== `category.${name}` ? t(`category.${name}`) : name;
    setEditCategoryValue(displayName);
  };

  const confirmEditCategory = () => {
    if (editingCategory && editCategoryValue.trim() && onEditCategory) {
      onEditCategory(editingCategory, editCategoryValue.trim());
    }
    setEditingCategory(null);
  };

  const startEditIncomeType = (name: string) => {
    setEditingIncomeType(name);
    const displayName = t(`incomeType.${name}`) !== `incomeType.${name}` ? t(`incomeType.${name}`) : name;
    setEditIncomeTypeValue(displayName);
  };

  const confirmEditIncomeType = () => {
    if (editingIncomeType && editIncomeTypeValue.trim() && onEditIncomeType) {
      onEditIncomeType(editingIncomeType, editIncomeTypeValue.trim());
    }
    setEditingIncomeType(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings.manageCategories')}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">{t('settings.manageCategories')}</TabsTrigger>
            <TabsTrigger value="incomeTypes">{t('settings.manageIncomeTypes')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('settings.language')}</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t('categories.name')}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">{language === 'pt' ? 'Cor:' : 'Color:'}</Label>
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${newCategoryColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {categories.map((category) => {
                  const color = getCategoryColor?.(category) || '#6b7280';
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      {editingCategory === category ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editCategoryValue}
                            onChange={(e) => setEditCategoryValue(e.target.value)}
                            className="h-7 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && confirmEditCategory()}
                            autoFocus
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={confirmEditCategory}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCategory(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <button
                            className="w-4 h-4 rounded-full border border-border/50 cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              // Cycle through colors
                              const idx = PRESET_COLORS.indexOf(color);
                              const nextColor = PRESET_COLORS[(idx + 1) % PRESET_COLORS.length];
                              onUpdateCategoryColor?.(category, nextColor);
                            }}
                            title={language === 'pt' ? 'Clique para mudar a cor' : 'Click to change color'}
                          />
                          {t(`category.${category}`) !== `category.${category}` 
                            ? t(`category.${category}`) 
                            : category}
                          {isDefaultCategory(category) && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </span>
                      )}
                      {editingCategory !== category && (
                        <div className="flex items-center gap-1">
                          {onEditCategory && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => startEditCategory(category)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                          {!isDefaultCategory(category) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onRemoveCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="incomeTypes" className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t('income.type')}
                  value={newIncomeType}
                  onChange={(e) => setNewIncomeType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIncomeType()}
                />
                <Button onClick={handleAddIncomeType} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">{language === 'pt' ? 'Cor:' : 'Color:'}</Label>
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${newIncomeTypeColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewIncomeTypeColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {incomeTypes.map((type) => {
                  const color = getIncomeTypeColor?.(type) || '#6b7280';
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      {editingIncomeType === type ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editIncomeTypeValue}
                            onChange={(e) => setEditIncomeTypeValue(e.target.value)}
                            className="h-7 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && confirmEditIncomeType()}
                            autoFocus
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={confirmEditIncomeType}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingIncomeType(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <button
                            className="w-4 h-4 rounded-full border border-border/50 cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              const idx = PRESET_COLORS.indexOf(color);
                              const nextColor = PRESET_COLORS[(idx + 1) % PRESET_COLORS.length];
                              onUpdateIncomeTypeColor?.(type, nextColor);
                            }}
                            title={language === 'pt' ? 'Clique para mudar a cor' : 'Click to change color'}
                          />
                          {t(`incomeType.${type}`) !== `incomeType.${type}` 
                            ? t(`incomeType.${type}`) 
                            : type}
                          {isDefaultIncomeType(type) && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </span>
                      )}
                      {editingIncomeType !== type && (
                        <div className="flex items-center gap-1">
                          {onEditIncomeType && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => startEditIncomeType(type)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                          {!isDefaultIncomeType(type) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onRemoveIncomeType(type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <Label>{t('settings.language')}</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'pt' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('pt')}
                  >
                    PT
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('en')}
                  >
                    EN
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                  <Label>{t('settings.highContrast')}</Label>
                </div>
                <Switch
                  checked={highContrast}
                  onCheckedChange={toggleHighContrast}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
