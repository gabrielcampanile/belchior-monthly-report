import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'pt';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Monthly Closure',
    'app.subtitle': 'Session-based finance tool',
    'app.currentPeriod': 'Current period',
    
    // Steps
    'steps.income': 'Income',
    'steps.import': 'Import',
    'steps.categorize': 'Categorize',
    'steps.summary': 'Summary',
    
    // Income Form
    'income.title': 'Add Your Income',
    'income.subtitle': 'Enter all income sources for this month',
    'income.newEntry': 'New Income Entry',
    'income.addNew': 'Add a new income source',
    'income.source': 'Income Source',
    'income.sourcePlaceholder': 'e.g., Company Name, Client Project...',
    'income.type': 'Income Type',
    'income.amount': 'Amount',
    'income.addButton': 'Add Income',
    'income.entries': 'Income Entries',
    'income.noEntries': 'No income entries yet',
    'income.addFirst': 'Add your first income entry',
    'income.total': 'Total Income',
    'income.continue': 'Continue to Expenses',
    
    // Income Types
    'incomeType.Salary': 'Salary',
    'incomeType.Freelance': 'Freelance',
    'incomeType.Other': 'Other',
    
    // CSV Import
    'import.title': 'Import Expenses',
    'import.subtitle': 'Upload your credit card statement or add expenses manually',
    'import.uploadCSV': 'Upload CSV File',
    'import.dragDrop': 'Drag and drop your CSV file here, or click to browse',
    'import.supported': 'Supports CSV files from most banks',
    'import.mapping': 'Column Mapping',
    'import.mappingDesc': 'Match your CSV columns to the required fields',
    'import.dateColumn': 'Date Column',
    'import.descColumn': 'Description Column',
    'import.amountColumn': 'Amount Column',
    'import.selectColumn': 'Select column',
    'import.preview': 'Preview',
    'import.confirmImport': 'Confirm Import',
    'import.transactions': 'transactions',
    'import.clearAll': 'Clear All Expenses',
    'import.expensesImported': 'expenses imported',
    'import.continue': 'Continue to Categorization',
    'import.back': 'Back',
    'import.addManual': 'Add Manual Expense',
    'import.manualEntry': 'Manual Entry',
    'import.manualDesc': 'Add individual expenses manually',
    'import.date': 'Date',
    'import.description': 'Description',
    'import.descPlaceholder': 'e.g., Restaurant, Gas station...',
    'import.addExpense': 'Add Expense',
    'import.fileType': 'File Type',
    'import.creditCard': 'Credit Card',
    'import.bankStatement': 'Bank Statement',
    'import.creditCardDesc': 'All values will be imported as expenses.',
    'import.bankStatementDesc': 'Positive values = income, negative values = expenses.',
    'import.incomeLabel': 'Income',
    'import.expenseLabel': 'Expense',
    'import.type': 'Type',
    'import.noValid': 'No valid transactions found in CSV',
    
    // Categories
    'categories.title': 'Manage Categories',
    'categories.subtitle': 'Customize expense categories',
    'categories.name': 'Category Name',
    'categories.add': 'Add Category',
    'categories.default': 'Default categories cannot be deleted',
    
    // Category names
    'category.Food': 'Food',
    'category.Transportation': 'Transportation',
    'category.Housing': 'Housing',
    'category.Personal purchases': 'Personal purchases',
    'category.Leisure': 'Leisure',
    'category.Health': 'Health',
    'category.Subscriptions': 'Subscriptions',
    'category.Electronics / Durable goods': 'Electronics / Durable goods',
    'category.Other': 'Other',
    
    // Expense Categorization
    'categorize.title': 'Categorize Expenses',
    'categorize.subtitle': 'Assign a category to each transaction',
    'categorize.stats': 'Categorization Stats',
    'categorize.total': 'Total Expenses',
    'categorize.count': 'Transactions',
    'categorize.avgTransaction': 'Avg. Transaction',
    'categorize.date': 'Date',
    'categorize.description': 'Description',
    'categorize.amount': 'Amount',
    'categorize.category': 'Category',
    'categorize.actions': 'Actions',
    'categorize.noExpenses': 'No expenses to categorize',
    'categorize.importFirst': 'Import your credit card statement first',
    'categorize.continue': 'View Summary',
    'categorize.back': 'Back',
    
    // Dashboard
    'dashboard.title': 'Monthly Summary',
    'dashboard.subtitle': 'Your financial overview for this month',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.netInvestment': 'Net Investment',
    'dashboard.invested': 'Invested',
    'dashboard.breakdown': 'Expense Breakdown',
    'dashboard.spentVsInvested': 'Spent vs Invested',
    'dashboard.spent': 'Spent',
    'dashboard.exportPDF': 'Export Monthly Report',
    'dashboard.back': 'Back',
    'dashboard.save': 'Save Closure',
    
    // Home
    'home.title': 'My Closures',
    'home.subtitle': 'Monthly financial closures',
    'home.newClosure': 'New Closure',
    'home.selectPeriod': 'Select Period',
    'home.month': 'Month',
    'home.year': 'Year',
    'home.startClosure': 'Start Closure',
    'home.empty': 'No closures yet',
    'home.emptyDesc': 'Create your first monthly closure to start tracking your finances.',
    'home.deleteTitle': 'Delete Closure',
    'home.deleteDesc': 'This action cannot be undone. All data for this closure will be permanently deleted.',
    'home.updatedAt': 'Updated',
    'home.savedTitle': 'Closure Saved',
    'home.savedDesc': 'Your monthly closure was saved successfully.',
    'home.backHome': 'Back to Home',

    // History
    'history.title': 'Financial History',
    'history.subtitle': 'Track your financial evolution over time',
    'history.allTime': 'All Time',
    'history.annual': 'Annual',
    'history.semester': 'Semester',
    'history.quarter': 'Quarter',
    'history.bimonth': 'Bimonthly',
    'history.evolution': 'Income vs Expenses Evolution',
    'history.comparison': 'Monthly Comparison',
    'history.investmentEvolution': 'Investment % Evolution',
    'history.monthComparison': 'Month-over-Month',
    'history.period': 'Period',
    'history.incomeChange': 'Income Δ',
    'history.expenseChange': 'Expenses Δ',
    'history.noData': 'No data for this period',
    'history.noDataDesc': 'Save some monthly closures to see your financial history.',
    'history.needMore': 'You need at least 2 closures to see evolution charts.',
    'history.totalIncome': 'Total Income',
    'history.totalExpenses': 'Total Expenses',
    'history.totalInvestment': 'Total Investment',
    'history.avgInvested': 'Avg. Invested',
    'history.avg': 'Avg',
    'history.months': 'months',

    // Nav
    'nav.home': 'Home',
    'nav.history': 'History',

    // Settings
    'settings.manageIncomeTypes': 'Manage Income Types',
    'settings.manageCategories': 'Manage Categories',
    'settings.language': 'Language',
    'settings.highContrast': 'High Contrast',
    
    // Auth
    'auth.subtitle': 'Sign in to manage your finances',
    'auth.googleButton': 'Sign in with Google',
    'auth.or': 'or continue with email',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginButton': 'Sign In',
    'auth.signupButton': 'Create Account',
    'auth.error': 'Authentication Error',
    'auth.checkEmail': 'Check your email',
    'auth.checkEmailDesc': 'We sent you a confirmation link.',
    'auth.logout': 'Logout',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
  },
  pt: {
    // Header
    'app.title': 'Fechamento Mensal',
    'app.subtitle': 'Ferramenta financeira por sessão',
    'app.currentPeriod': 'Período atual',
    
    // Steps
    'steps.income': 'Renda',
    'steps.import': 'Importar',
    'steps.categorize': 'Categorizar',
    'steps.summary': 'Resumo',
    
    // Income Form
    'income.title': 'Adicione sua Renda',
    'income.subtitle': 'Insira todas as fontes de renda deste mês',
    'income.newEntry': 'Nova Entrada de Renda',
    'income.addNew': 'Adicionar nova fonte de renda',
    'income.source': 'Fonte de Renda',
    'income.sourcePlaceholder': 'ex., Nome da Empresa, Projeto do Cliente...',
    'income.type': 'Tipo de Renda',
    'income.amount': 'Valor',
    'income.addButton': 'Adicionar Renda',
    'income.entries': 'Entradas de Renda',
    'income.noEntries': 'Nenhuma entrada de renda ainda',
    'income.addFirst': 'Adicione sua primeira entrada de renda',
    'income.total': 'Renda Total',
    'income.continue': 'Continuar para Despesas',
    
    // Income Types
    'incomeType.Salary': 'Salário',
    'incomeType.Freelance': 'Freelance',
    'incomeType.Other': 'Outro',
    
    // CSV Import
    'import.title': 'Importar Despesas',
    'import.subtitle': 'Faça upload da fatura do cartão ou adicione despesas manualmente',
    'import.uploadCSV': 'Upload de Arquivo CSV',
    'import.dragDrop': 'Arraste e solte seu arquivo CSV aqui, ou clique para navegar',
    'import.supported': 'Suporta arquivos CSV da maioria dos bancos',
    'import.mapping': 'Mapeamento de Colunas',
    'import.mappingDesc': 'Associe as colunas do CSV aos campos necessários',
    'import.dateColumn': 'Coluna de Data',
    'import.descColumn': 'Coluna de Descrição',
    'import.amountColumn': 'Coluna de Valor',
    'import.selectColumn': 'Selecionar coluna',
    'import.preview': 'Prévia',
    'import.confirmImport': 'Confirmar Importação',
    'import.transactions': 'transações',
    'import.clearAll': 'Limpar Todas as Despesas',
    'import.expensesImported': 'despesas importadas',
    'import.continue': 'Continuar para Categorização',
    'import.back': 'Voltar',
    'import.addManual': 'Adicionar Despesa Manual',
    'import.manualEntry': 'Entrada Manual',
    'import.manualDesc': 'Adicione despesas individuais manualmente',
    'import.date': 'Data',
    'import.description': 'Descrição',
    'import.descPlaceholder': 'ex., Restaurante, Posto de gasolina...',
    'import.addExpense': 'Adicionar Despesa',
    'import.fileType': 'Tipo de Arquivo',
    'import.creditCard': 'Fatura de Cartão',
    'import.bankStatement': 'Extrato Bancário',
    'import.creditCardDesc': 'Todos os valores serão importados como despesas.',
    'import.bankStatementDesc': 'Valores positivos = receita, negativos = despesa.',
    'import.incomeLabel': 'Receita',
    'import.expenseLabel': 'Despesa',
    'import.type': 'Tipo',
    'import.noValid': 'Nenhuma transação válida encontrada no CSV',
    
    // Categories
    'categories.title': 'Gerenciar Categorias',
    'categories.subtitle': 'Personalize as categorias de despesas',
    'categories.name': 'Nome da Categoria',
    'categories.add': 'Adicionar Categoria',
    'categories.default': 'Categorias padrão não podem ser excluídas',
    
    // Category names
    'category.Food': 'Alimentação',
    'category.Transportation': 'Transporte',
    'category.Housing': 'Moradia',
    'category.Personal purchases': 'Compras pessoais',
    'category.Leisure': 'Lazer',
    'category.Health': 'Saúde',
    'category.Subscriptions': 'Assinaturas',
    'category.Electronics / Durable goods': 'Eletrônicos / Bens duráveis',
    'category.Other': 'Outros',
    
    // Expense Categorization
    'categorize.title': 'Categorizar Despesas',
    'categorize.subtitle': 'Atribua uma categoria a cada transação',
    'categorize.stats': 'Estatísticas de Categorização',
    'categorize.total': 'Total de Despesas',
    'categorize.count': 'Transações',
    'categorize.avgTransaction': 'Média por Transação',
    'categorize.date': 'Data',
    'categorize.description': 'Descrição',
    'categorize.amount': 'Valor',
    'categorize.category': 'Categoria',
    'categorize.actions': 'Ações',
    'categorize.noExpenses': 'Nenhuma despesa para categorizar',
    'categorize.importFirst': 'Importe sua fatura de cartão primeiro',
    'categorize.continue': 'Ver Resumo',
    'categorize.back': 'Voltar',
    
    // Dashboard
    'dashboard.title': 'Resumo Mensal',
    'dashboard.subtitle': 'Sua visão financeira deste mês',
    'dashboard.totalIncome': 'Renda Total',
    'dashboard.totalExpenses': 'Total de Despesas',
    'dashboard.netInvestment': 'Investimento Líquido',
    'dashboard.invested': 'Investido',
    'dashboard.breakdown': 'Detalhamento de Despesas',
    'dashboard.spentVsInvested': 'Gasto vs Investido',
    'dashboard.spent': 'Gasto',
    'dashboard.exportPDF': 'Exportar Relatório Mensal',
    'dashboard.back': 'Voltar',
    'dashboard.save': 'Salvar Fechamento',
    
    // Home
    'home.title': 'Meus Fechamentos',
    'home.subtitle': 'Fechamentos financeiros mensais',
    'home.newClosure': 'Novo Fechamento',
    'home.selectPeriod': 'Selecionar Período',
    'home.month': 'Mês',
    'home.year': 'Ano',
    'home.startClosure': 'Iniciar Fechamento',
    'home.empty': 'Nenhum fechamento ainda',
    'home.emptyDesc': 'Crie seu primeiro fechamento mensal para começar a acompanhar suas finanças.',
    'home.deleteTitle': 'Excluir Fechamento',
    'home.deleteDesc': 'Esta ação não pode ser desfeita. Todos os dados deste fechamento serão permanentemente excluídos.',
    'home.updatedAt': 'Atualizado',
    'home.savedTitle': 'Fechamento Salvo',
    'home.savedDesc': 'Seu fechamento mensal foi salvo com sucesso.',
    'home.backHome': 'Voltar ao Início',

    // History
    'history.title': 'Histórico Financeiro',
    'history.subtitle': 'Acompanhe sua evolução financeira ao longo do tempo',
    'history.allTime': 'Todo o Período',
    'history.annual': 'Anual',
    'history.semester': 'Semestral',
    'history.quarter': 'Trimestral',
    'history.bimonth': 'Bimestral',
    'history.evolution': 'Evolução Receita vs Despesas',
    'history.comparison': 'Comparativo Mensal',
    'history.investmentEvolution': 'Evolução % Investido',
    'history.monthComparison': 'Mês a Mês',
    'history.period': 'Período',
    'history.incomeChange': 'Renda Δ',
    'history.expenseChange': 'Despesas Δ',
    'history.noData': 'Sem dados para este período',
    'history.noDataDesc': 'Salve alguns fechamentos mensais para ver seu histórico financeiro.',
    'history.needMore': 'Você precisa de pelo menos 2 fechamentos para ver os gráficos de evolução.',
    'history.totalIncome': 'Renda Total',
    'history.totalExpenses': 'Total de Despesas',
    'history.totalInvestment': 'Investimento Total',
    'history.avgInvested': 'Média Investida',
    'history.avg': 'Média',
    'history.months': 'meses',

    // Nav
    'nav.home': 'Início',
    'nav.history': 'Histórico',

    
    // Settings
    'settings.manageIncomeTypes': 'Gerenciar Tipos de Renda',
    'settings.manageCategories': 'Gerenciar Categorias',
    'settings.language': 'Idioma',
    'settings.highContrast': 'Alto Contraste',
    
    // Auth
    'auth.subtitle': 'Faça login para gerenciar suas finanças',
    'auth.googleButton': 'Entrar com Google',
    'auth.or': 'ou continue com email',
    'auth.login': 'Entrar',
    'auth.signup': 'Criar Conta',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.loginButton': 'Entrar',
    'auth.signupButton': 'Criar Conta',
    'auth.error': 'Erro de Autenticação',
    'auth.checkEmail': 'Verifique seu email',
    'auth.checkEmailDesc': 'Enviamos um link de confirmação.',
    'auth.logout': 'Sair',

    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.close': 'Fechar',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');
  const [highContrast, setHighContrast] = useState(false);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <AppContext.Provider value={{ language, setLanguage, highContrast, toggleHighContrast, t }}>
      <div className={highContrast ? 'high-contrast' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
