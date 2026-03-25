

# Redesign Completo - Fintech Premium

## Visao Geral

Redesign completo da interface para transmitir sofisticacao de banco digital premium, mantendo o fluxo funcional existente. Dark mode com paleta refinada, tipografia premium, navegacao lateral compacta e visual inspirado em Nubank/XP.

## Paleta de Cores (Nova)

```text
Background:     #0A0A0F (quase preto azulado)
Surface/Card:   #12121A (cards elevados)
Surface-2:      #1A1A26 (cards secundarios)
Border:         #1E1E2E (sutil)
Primary:        #7C5CFC (roxo premium, estilo Nubank)
Primary-light:  #9B7FFF
Income/Green:   #00D47E
Expense/Red:    #FF4D6A
Investment:     #7C5CFC
Muted text:     #6B6B80
Foreground:     #F0F0F5
```

## Estrutura de Navegacao

Trocar o Header atual por um **Sidebar compacta** (icones apenas, expandivel no hover) no desktop e **Bottom navigation** no mobile. Corrigir navegacao para usar `navigate(-1)` nos botoes de voltar em vez de `navigate('/')`.

```text
Desktop (sidebar esquerda):
┌──┐──────────────────────────┐
│🏠│                          │
│📊│     Conteudo principal   │
│⚙️│                          │
│  │                          │
│👤│                          │
└──┘──────────────────────────┘

Mobile (bottom nav):
┌────────────────────────────┐
│      Conteudo principal    │
│                            │
├────┬────┬────┬────┐
│ 🏠 │ 📊 │ ⚙️ │ 👤 │
└────┴────┴────┴────┘
```

## Plano por Arquivo

### 1. `src/index.css` - Nova paleta e tokens
- Substituir todas as variaveis CSS com nova paleta premium
- Remover high-contrast (manter funcionalidade mas integrar melhor)
- Adicionar gradientes sutis e sombras refinadas
- Nova font-family: Inter (mais premium que DM Sans)

### 2. `src/components/Layout.tsx` (NOVO)
- Componente wrapper com sidebar + area de conteudo
- Sidebar: logo, nav items (Home, Historico, Configuracoes), avatar + logout
- Sidebar colapsada por padrao (56px), expande no hover (220px)
- Mobile: bottom navigation bar fixa
- Substitui o `<Header>` atual em todas as paginas

### 3. `src/components/Header.tsx` - REMOVER
- Toda a navegacao migra para o Layout/Sidebar
- Remover props desnecessarias de categorias (eram usadas para o SettingsDialog antigo)

### 4. `src/pages/Auth.tsx` - Login premium
- Fundo com gradiente sutil ou pattern
- Card centralizado com glassmorphism leve
- Logo maior e mais impactante
- Botoes com hover refinado

### 5. `src/pages/Home.tsx` - Dashboard de closures
- Remover Header, usar Layout
- Cards de fechamento com design mais limpo: bordas sutis, hover com glow
- Badges de status redesenhados (pill mais elegante)
- Grid responsivo mantido
- Botao "Novo Fechamento" com destaque visual premium

### 6. `src/pages/Closure.tsx` - Wizard de fechamento
- Usar Layout em vez de Header
- **Corrigir navegacao**: botao voltar usa `navigate(-1)` em vez de `navigate('/')`
- Step indicator redesenhado: mais fino, com linha conectora animada

### 7. `src/components/StepIndicator.tsx` - Redesign
- Design mais fino e elegante
- Linha conectora com gradiente animado
- Circulos menores, mais refinados

### 8. `src/components/CSVImport.tsx` - Refinamento visual
- Upload area com borda tracejada mais sutil
- Preview table com design mais limpo
- Cards de passos com visual mais flat

### 9. `src/components/IncomeForm.tsx` - Refinamento
- Tabela com linhas mais finas, hover sutil
- Inputs mais refinados
- Cores semanticas da nova paleta

### 10. `src/components/ExpenseCategorization.tsx` - Refinamento
- Mesmo tratamento da IncomeForm
- Badges de categoria com pill design

### 11. `src/components/Dashboard.tsx` - Summary premium
- Metric cards com gradiente sutil no topo (barra colorida)
- Pie charts com estilo mais refinado
- Progress bar de gasto vs investido mais elegante

### 12. `src/pages/History.tsx` - Refinamento
- Usar Layout
- Corrigir botao voltar para `navigate(-1)`
- Tabela comparativa mais elegante

### 13. `src/pages/Settings.tsx` - Refinamento
- Usar Layout
- Corrigir botao voltar para `navigate(-1)`
- Cards mais limpos

### 14. `src/components/ui/button.tsx` - Variantes premium
- Variante `default` com gradiente sutil no primary
- Hover states mais sofisticados

### 15. Correcoes de Roteamento
- Em **todos** os botoes "voltar", substituir `navigate('/')` por `navigate(-1)`
- Paginas afetadas: `Closure.tsx`, `History.tsx`, `Settings.tsx`

## Ordem de Implementacao

1. `index.css` (tokens e paleta) + importar fonte Inter
2. `Layout.tsx` (novo componente de navegacao)
3. Atualizar todas as paginas para usar Layout e remover Header
4. Corrigir navegacao (botoes voltar)
5. Refinar componentes individuais (StepIndicator, CSVImport, Dashboard, etc.)
6. Auth page

## Detalhes Tecnicos

- Manter Tailwind CSS, shadcn/ui, Recharts
- Nenhuma mudanca de banco de dados necessaria
- Nenhuma mudanca de logica de negocio - apenas visual e navegacao
- Fonte Inter via Google Fonts CDN
- Sidebar usa CSS transitions para expand/collapse
- Mobile detection via `use-mobile.tsx` hook existente

