import { useState } from 'react';
import { Settings, Plus, Trash2, Languages, Sun } from 'lucide-react';
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

interface SettingsDialogProps {
  categories: string[];
  incomeTypes: string[];
  onAddCategory: (name: string) => boolean;
  onRemoveCategory: (name: string) => boolean;
  onAddIncomeType: (name: string) => boolean;
  onRemoveIncomeType: (name: string) => boolean;
  isDefaultCategory: (name: string) => boolean;
  isDefaultIncomeType: (name: string) => boolean;
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
}: SettingsDialogProps) {
  const { language, setLanguage, highContrast, toggleHighContrast, t } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [newIncomeType, setNewIncomeType] = useState('');

  const handleAddCategory = () => {
    if (onAddCategory(newCategory)) {
      setNewCategory('');
    }
  };

  const handleAddIncomeType = () => {
    if (onAddIncomeType(newIncomeType)) {
      setNewIncomeType('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="flex items-center gap-2">
                      {t(`category.${category}`) !== `category.${category}` 
                        ? t(`category.${category}`) 
                        : category}
                      {isDefaultCategory(category) && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </span>
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
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="incomeTypes" className="space-y-4">
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
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {incomeTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="flex items-center gap-2">
                      {t(`incomeType.${type}`) !== `incomeType.${type}` 
                        ? t(`incomeType.${type}`) 
                        : type}
                      {isDefaultIncomeType(type) && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </span>
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
                ))}
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
