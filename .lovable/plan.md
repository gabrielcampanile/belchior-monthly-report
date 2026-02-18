

# Funcionalidade de Acompanhamento de Investimentos

## Conceito

Uma nova area dedicada para acompanhar a evolucao do patrimonio investido ao longo dos meses. O usuario registra o saldo total dos investimentos a cada mes, e o sistema calcula automaticamente o rendimento real com base na formula:

```text
Rendimento = Saldo Atual - (Saldo Mes Anterior + Aporte do Mes)
```

Onde o **aporte do mes** e o valor investido calculado no fechamento mensal (receita - despesa).

---

## 1. Nova tabela no banco de dados

Criar tabela `investment_snapshots` para armazenar o saldo mensal de investimentos:

- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL)
- `month` (integer, NOT NULL)
- `year` (integer, NOT NULL)
- `balance` (numeric, NOT NULL) -- saldo total dos investimentos naquele mes
- `contribution` (numeric, DEFAULT 0) -- aporte do mes (copiado do fechamento)
- `created_at` / `updated_at` (timestamptz)
- UNIQUE(user_id, month, year)
- RLS: cada usuario ve/edita apenas seus proprios registros

---

## 2. Nova pagina `/investments`

Pagina dedicada com:

- **Card de saldo atual**: ultimo saldo registrado com destaque
- **Formulario de registro**: selecionar mes/ano e informar o saldo atual dos investimentos. Se houver fechamento do mes, o aporte e preenchido automaticamente (editavel).
- **Tabela historica** com colunas:
  - Periodo (mes/ano)
  - Saldo
  - Aporte do mes
  - Rendimento (calculado)
  - Rentabilidade % (rendimento / saldo anterior)
- **Grafico de evolucao**: linha mostrando saldo ao longo dos meses, com barras empilhadas de aporte vs rendimento

---

## 3. Hook `useInvestments`

Novo hook para gerenciar os snapshots:

- `fetchSnapshots()` -- busca todos os registros do usuario
- `saveSnapshot(month, year, balance, contribution)` -- upsert
- `deleteSnapshot(id)`
- `getCalculatedData()` -- retorna array com rendimento e rentabilidade calculados para cada mes

Logica de calculo:
```text
Para cada mes (ordenado cronologicamente):
  - Se primeiro mes: rendimento = 0
  - Senão: rendimento = saldo_atual - (saldo_anterior + aporte_mes_atual)
  - Rentabilidade % = rendimento / saldo_anterior * 100
```

---

## 4. Integracao com fechamentos existentes

Ao salvar um snapshot, se existir um fechamento mensal (`monthly_closures`) para o mesmo mes/ano, o campo `contribution` sera preenchido automaticamente com o `totalInvestment` (receita - despesa) daquele fechamento. O usuario pode ajustar manualmente caso o aporte real tenha sido diferente.

---

## 5. Navegacao

- Adicionar link "Investimentos" no Header ao lado de "Historico"
- Adicionar rota `/investments` protegida no `App.tsx`

---

## Detalhes Tecnicos

### Migracao SQL

```sql
CREATE TABLE investment_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  contribution numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE investment_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON investment_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots"
  ON investment_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snapshots"
  ON investment_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snapshots"
  ON investment_snapshots FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_investment_snapshots_updated_at
  BEFORE UPDATE ON investment_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Arquivos a criar
- `src/pages/Investments.tsx` -- pagina principal
- `src/hooks/useInvestments.ts` -- hook de dados
- `src/components/InvestmentChart.tsx` -- grafico de evolucao

### Arquivos a modificar
- `src/App.tsx` -- rota `/investments`
- `src/components/Header.tsx` -- link de navegacao
- `src/contexts/AppContext.tsx` -- traducoes (investments.*)

