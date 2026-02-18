# Reestruturação do Fluxo e Melhorias de UX

## 1. Reordenar o Wizard (Import primeiro)

O fluxo atual e 1.Renda -> 2.Import -> 3.Categorizar -> 4.Resumo. O novo fluxo sera:

1. **Import** (CSV upload -- ponto de entrada principal)
2. **Renda** (visualizar/editar/categorizar rendas importadas + adicionar manualmente)
3. **Despesas** (visualizar/editar/categorizar despesas -- antigo "Categorize" + adicionar manualmente)
4. **Resumo** (Dashboard)

Alteracoes em `src/pages/Closure.tsx`: reordenar o array STEPS e ajustar o `renderStep()`.

---

## 2. Rendas: permitir data, categorização e edição

Atualmente `IncomeEntry` so tem `source`, `type`, `amount`. Precisa adicionar `date` ao tipo.

- `**src/types/finance.ts**`: adicionar campo `date?: string` em `IncomeEntry`.
- `**src/components/IncomeForm.tsx**`: transformar no mesmo estilo da tabela de despesas -- exibir tabela com colunas data, descricao, tipo (com select editavel), valor, e acoes (remover). Incluir formulario manual para adicionar.
- `**src/hooks/useFinanceStore.ts**`: adicionar `updateIncomeType(id, type)` para editar o tipo de renda inline.
- **DB `closure_incomes**`: adicionar coluna `date` (text, nullable) via migracao.

---

## 3. Salvar categorias customizadas no banco

Atualmente `useCategoryStore` usa apenas `useState` local. Precisamos persistir no banco.

- **Migracao SQL**: criar tabela `user_categories` com colunas `id`, `user_id`, `name`, `type` ('expense' | 'income'), `created_at`, com RLS por user_id.
- `**src/hooks/useCategoryStore.ts**`: refatorar para carregar categorias do banco ao inicializar e salvar/remover via Supabase, mantendo os defaults como fallback.

---

## 4. Bug: duas bolinhas de cor na categorização de despesas

No `ExpenseCategorization.tsx` linha 202-205, o `SelectTrigger` ja mostra uma bolinha, e o `SelectItem` (linhas 210-213) tambem mostra outra. Quando o valor selecionado e renderizado no trigger, ele usa o conteudo do SelectItem (que tem bolinha) dentro do trigger (que tambem tem bolinha).

**Fix**: remover a bolinha do `SelectTrigger` (linhas 203-204) OU remover a bolinha dos `SelectItem`. A solucao mais limpa e manter a bolinha apenas no `SelectValue` customizado e remover do trigger wrapper.

---

## 5. Cards de fechamento maiores na Home

Os cards atuais (`Home.tsx`) usam `grid-cols-3` com conteudo comprimido. Alteracoes:

- Mudar grid para `md:grid-cols-2` (maximo 2 colunas) para cards maiores.
- Aumentar o padding e tamanho da fonte dos valores.
- Foco principal: mostrar **Receita**, **Despesa** e **Valor Investido** (nao percentual). Trocar `investedPercentage` por `totalInvestment` no card (usando `formatCurrency`).
- Manter percentual como informacao secundaria menor.

---

## 6. Historia: maior enfase no valor investido

- `**PeriodSummaryCards.tsx**`: ja mostra `totalInvestment` -- ok. Garantir destaque visual.
- `**HistoryCharts.tsx**`: adicionar grafico dedicado de evolucao do valor investido (alem do percentual que ja existe). O grafico de linhas principal ja inclui investment, mas podemos dar mais destaque.
- `**History.tsx` tabela**: mostrar coluna "Investido (valor)" alem da coluna "Investido (%)" que ja existe.

---

## 7. Area logada de usuario (pagina de configuracoes)

Criar uma pagina `/settings` dedicada em vez de depender apenas do modal pequeno:

- `**src/pages/Settings.tsx**`: pagina completa com secoes:
  - Perfil (nome, avatar)
  - Categorias de despesa (gerenciar)
  - Tipos de renda (gerenciar)
  - Preferencias (idioma, alto contraste)
- `**src/App.tsx**`: adicionar rota `/settings` protegida.
- `**src/components/Header.tsx**`: trocar o icone de settings (que abre modal) por link para `/settings`. Ou manter ambos, com o avatar/nome clicavel levando a `/settings`.
- `**src/components/SettingsDialog.tsx**`: pode ser removido ou mantido como atalho. O modal atual (`sm:max-w-[500px]`) e muito pequeno -- a pagina dedicada resolve isso.

---

## Detalhes Tecnicos

### Migracao SQL

```sql
-- Adicionar coluna date em closure_incomes
ALTER TABLE closure_incomes ADD COLUMN IF NOT EXISTS date text;

-- Tabela de categorias customizadas do usuario
CREATE TABLE user_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON user_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON user_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON user_categories FOR DELETE USING (auth.uid() = user_id);
```

### Arquivos a criar

- `src/pages/Settings.tsx`

### Arquivos a modificar

- `src/types/finance.ts` (date em IncomeEntry)
- `src/hooks/useFinanceStore.ts` (updateIncomeType)
- `src/hooks/useCategoryStore.ts` (persistencia no banco)
- `src/components/IncomeForm.tsx` (tabela editavel com data e tipo)
- `src/components/ExpenseCategorization.tsx` (fix bolinha duplicada)
- `src/pages/Closure.tsx` (reordenar steps)
- `src/pages/Home.tsx` (cards maiores, valor investido)
- `src/pages/History.tsx` (coluna valor investido)
- `src/components/HistoryCharts.tsx` (grafico valor investido)
- `src/components/Header.tsx` (link para /settings)
- `src/App.tsx` (rota /settings)
- `src/contexts/AppContext.tsx` (novas traducoes)