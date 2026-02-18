import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Languages, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useCategoryStore } from '@/hooks/useCategoryStore';

export default function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, highContrast, toggleHighContrast, t } = useApp();
  const { user } = useAuth();
  const categoryStore = useCategoryStore();
  const [newCategory, setNewCategory] = useState('');
  const [newIncomeType, setNewIncomeType] = useState('');

  const displayName = user?.user_metadata?.full_name || user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleAddCategory = () => {
    if (categoryStore.addCategory(newCategory)) setNewCategory('');
  };
  const handleAddIncomeType = () => {
    if (categoryStore.addIncomeType(newIncomeType)) setNewIncomeType('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        categories={categoryStore.categories}
        incomeTypes={categoryStore.incomeTypes}
        onAddCategory={categoryStore.addCategory}
        onRemoveCategory={categoryStore.removeCategory}
        onAddIncomeType={categoryStore.addIncomeType}
        onRemoveIncomeType={categoryStore.removeIncomeType}
        isDefaultCategory={categoryStore.isDefaultCategory}
        isDefaultIncomeType={categoryStore.isDefaultIncomeType}
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{t('settings.pageTitle')}</h2>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('settings.profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-lg">{displayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{t('settings.manageCategories')}</CardTitle>
              <CardDescription>{t('categories.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('categories.name')}
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categoryStore.categories.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="flex items-center gap-2">
                      {t(`category.${category}`) !== `category.${category}` ? t(`category.${category}`) : category}
                      {categoryStore.isDefaultCategory(category) && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </span>
                    {!categoryStore.isDefaultCategory(category) && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => categoryStore.removeCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Income Types */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{t('settings.manageIncomeTypes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('income.type')}
                  value={newIncomeType}
                  onChange={e => setNewIncomeType(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddIncomeType()}
                />
                <Button onClick={handleAddIncomeType} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categoryStore.incomeTypes.map(type => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="flex items-center gap-2">
                      {t(`incomeType.${type}`) !== `incomeType.${type}` ? t(`incomeType.${type}`) : type}
                      {categoryStore.isDefaultIncomeType(type) && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </span>
                    {!categoryStore.isDefaultIncomeType(type) && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => categoryStore.removeIncomeType(type)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{t('settings.preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <Label>{t('settings.language')}</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant={language === 'pt' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('pt')}>PT</Button>
                  <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                  <Label>{t('settings.highContrast')}</Label>
                </div>
                <Switch checked={highContrast} onCheckedChange={toggleHighContrast} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
