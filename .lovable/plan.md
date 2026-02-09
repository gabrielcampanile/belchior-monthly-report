
# Plano: Evoluir para SaaS de Planejamento Financeiro

## Resumo

Transformar a ferramenta de sessao unica em um SaaS completo com:
- Login com Google (Supabase Auth)
- Banco de dados para salvar fechamentos mensais
- Historico mes a mes com balanco anual/semestral
- Suporte a extrato bancario (entradas + saidas pelo sinal do valor)
- Auto-categorizacao por regras de palavras-chave
- Dashboard historico multi-periodo

---

## Fase 1: Infraestrutura (Supabase + Auth)

### 1.1 Habilitar Lovable Cloud
- Ativar Supabase integrado para ter banco de dados e autenticacao

### 1.2 Login com Google
- Configurar provider Google no Supabase Dashboard
- Criar pagina de login (`/auth`) com botao "Entrar com Google"
- Criar tabela `profiles` com trigger para auto-criar perfil no signup
- Adicionar rota protegida - redirecionar para `/auth` se nao logado
- Adicionar botao de logout no Header

### 1.3 Esquema do Banco de Dados

```text
profiles
  - id (uuid, FK auth.users)
  - display_name (text)
  - created_at (timestamp)

monthly_closures
  - id (uuid, PK)
  - user_id (uuid, FK auth.users)
  - month (integer, 1-12)
  - year (integer)
  - total_income (numeric)
  - total_expenses (numeric)
  - total_investment (numeric)
  - spent_percentage (numeric)
  - invested_percentage (numeric)
  - created_at (timestamp)
  - UNIQUE(user_id, month, year)

closure_incomes
  - id (uuid, PK)
  - closure_id (uuid, FK monthly_closures)
  - source (text)
  - type (text)
  - amount (numeric)

closure_expenses
  - id (uuid, PK)
  - closure_id (uuid, FK monthly_closures)
  - date (text)
  - description (text)
  - amount (numeric)
  - category (text)

user_categories
  - id (uuid, PK)
  - user_id (uuid, FK auth.users)
  - name (text)
  - type (text: 'expense' | 'income')

categorization_rules
  - id (uuid, PK)
  - user_id (uuid, FK auth.users)
  - keyword (text)
  - category (text)
```

RLS: cada tabela com politica `user_id = auth.uid()` (ou via closure_id para sub-tabelas).

---

## Fase 2: Fluxo Principal Atualizado

### 2.1 Selecao de Mes/Ano
- Ao entrar, usuario escolhe o mes/ano para fechar (ou continuar um fechamento existente)
- Se ja existe fechamento para aquele mes, carrega os dados salvos
- Lista de fechamentos anteriores visivel na pagina inicial

### 2.2 Suporte a Extrato Bancario
- Na tela de importacao CSV, adicionar opcao: "Tipo de arquivo"
  - **Fatura de cartao de credito**: tudo e despesa (comportamento atual)
  - **Extrato bancario**: valores positivos = receita, negativos = despesa
- Quando extrato bancario: valores positivos sao adicionados automaticamente como receita, negativos como despesa

### 2.3 Auto-categorizacao por Palavras-chave
- Tabela `categorization_rules` com pares keyword/categoria por usuario
- Regras padrao pre-carregadas (ex: "uber" -> Transporte, "ifood" -> Alimentacao, "netflix" -> Assinaturas, "mercado"/"supermercado" -> Alimentacao, etc.)
- Ao importar CSV, cada descricao e comparada com as regras; se match, categoria e sugerida automaticamente
- Usuario pode adicionar/editar regras na tela de Settings
- Categorias sem match ficam como "Other" para categorizacao manual

### 2.4 Salvar Fechamento
- Botao "Salvar Fechamento" no Dashboard (alem do Export PDF)
- Salva todos os dados (receitas, despesas categorizadas, resumo) no banco
- Se fechamento do mesmo mes ja existe, pergunta se quer sobrescrever

---

## Fase 3: Historico e Balancos

### 3.1 Pagina de Historico (`/history`)
- Lista todos os fechamentos salvos, ordenados por data
- Cards com resumo rapido (receita, despesa, investimento)
- Click para ver detalhes de qualquer mes

### 3.2 Balancos Multi-Periodo
- Na pagina de historico, filtros de periodo: mensal, bimestral, trimestral, semestral, anual
- Graficos de evolucao: linha do tempo de receita vs despesa vs investimento
- Media de gastos por categoria ao longo do periodo selecionado
- Comparativo mes a mes (quanto gastou mais/menos que o mes anterior)

---

## Fase 4: Navegacao e UX

### 4.1 Nova Estrutura de Rotas
- `/auth` - Login com Google
- `/` - Pagina inicial (lista de fechamentos + botao "Novo Fechamento")
- `/closure/:id` ou `/closure/new?month=X&year=Y` - Fluxo de fechamento (steps 1-4)
- `/history` - Historico e balancos

### 4.2 Atualizacoes no Header
- Mostrar nome/avatar do usuario
- Navegacao: Inicio, Historico, Configuracoes
- Botao de logout

---

## Detalhes Tecnicos

### Arquivos Novos
- `src/pages/Auth.tsx` - Pagina de login
- `src/pages/Home.tsx` - Lista de fechamentos
- `src/pages/History.tsx` - Historico e balancos
- `src/pages/Closure.tsx` - Fluxo de fechamento (substitui Index.tsx atual)
- `src/hooks/useAuth.ts` - Hook de autenticacao
- `src/components/ClosureList.tsx` - Lista de fechamentos
- `src/components/PeriodSelector.tsx` - Seletor de periodo para balancos
- `src/components/HistoryCharts.tsx` - Graficos de evolucao
- `src/components/AutoCategorizer.tsx` - Configuracao de regras de auto-categorizacao
- `src/integrations/supabase/` - Client e tipos gerados
- Migracoes SQL para todas as tabelas + RLS

### Arquivos Modificados
- `src/App.tsx` - Novas rotas + auth guard
- `src/components/Header.tsx` - Navegacao, avatar, logout
- `src/components/CSVImport.tsx` - Opcao extrato bancario + auto-categorizacao
- `src/components/Dashboard.tsx` - Botao "Salvar Fechamento"
- `src/components/SettingsDialog.tsx` - Regras de auto-categorizacao
- `src/hooks/useFinanceStore.ts` - Carregar/salvar do banco
- `src/contexts/AppContext.tsx` - Novas traducoes
- `src/pages/Index.tsx` - Redirecionar para Home

### Ordem de Implementacao
1. Habilitar Lovable Cloud + Supabase
2. Criar tabelas e RLS (migracoes)
3. Auth com Google + pagina de login + profiles
4. Adaptar fluxo de fechamento para salvar no banco
5. Pagina Home com lista de fechamentos
6. Extrato bancario (receita/despesa pelo sinal)
7. Auto-categorizacao por regras
8. Pagina de historico com balancos multi-periodo
