# Visual Changes: Expense Tracking Feature

## Dashboard Layout Changes

### Before (4 Cards)
```
┌─────────────────────────────────────────────────────────────────────┐
│                         📊 Dashboard                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   BLUE     │  │   GREEN    │  │    RED     │  │   PURPLE   │   │
│  │  Saldo     │  │  Pontos +  │  │  Pontos -  │  │   Saldo    │   │
│  │  Inicial   │  │   Hoje     │  │   Hoje     │  │   Atual    │   │
│  │            │  │            │  │            │  │            │   │
│  │    100     │  │    +50     │  │    -10     │  │    140     │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### After (5 Cards)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              📊 Dashboard                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   BLUE   │  │  GREEN   │  │   RED    │  │  ORANGE  │  │  PURPLE  │      │
│  │  Saldo   │  │ Pontos + │  │ Pontos - │  │  Gastos  │  │  Saldo   │      │
│  │ Inicial  │  │   Hoje   │  │   Hoje   │  │  do Dia  │  │  Atual   │      │
│  │          │  │          │  │          │  │          │  │          │      │
│  │   100    │  │   +50    │  │   -10    │  │   -20    │  │   120    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Grid changed from 4 to 5 columns (`md:grid-cols-4` → `md:grid-cols-5`)
- New ORANGE card added for "Gastos do Dia" (Expenses Today)
- Positioned between negative points and current balance
- Saldo Atual now reflects expenses: 100 + 50 - 10 - 20 = 120

## New UI Elements

### 1. Expense Registration Modal
```
┌────────────────────────────────────────────┐
│         Adicionar Gasto                    │
├────────────────────────────────────────────┤
│                                            │
│  Descrição                                 │
│  ┌──────────────────────────────────────┐  │
│  │ Ex: Sorvete, Brinquedo, etc.        │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Valor (pontos)                            │
│  ┌──────────────────────────────────────┐  │
│  │ Ex: 10                              │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Data                                      │
│  ┌──────────────────────────────────────┐  │
│  │ [📅 Date Picker]                    │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌─────────────┐  ┌─────────────┐         │
│  │   Salvar    │  │  Cancelar   │         │
│  └─────────────┘  └─────────────┘         │
│                                            │
└────────────────────────────────────────────┘
```

**Styling:**
- Background: White
- Overlay: Black with 50% opacity
- Buttons: Orange for save, gray for cancel
- Centered on screen with max-width

### 2. Expense List Section
```
┌─────────────────────────────────────────────────────────────────┐
│  💰 Gastos                         [+ Adicionar Gasto]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Sorvete                                          🗑️     │  │
│  │  15/01/2024                                       -10     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Brinquedo                                        🗑️     │  │
│  │  14/01/2024                                       -15     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Header with title and "Add" button
- List items with white background
- Orange color for amounts (-10, -15)
- Delete button (trash icon) on the right
- Date displayed in Brazilian format (DD/MM/YYYY)

### 3. Historical Table - Updated
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  📊 Histórico Diário de Pontos                [📋 Tabela] [📈 Gráfico]            │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │ Data     │ Saldo  │ Pontos │ Pontos │ Gastos │ Balanço │ Saldo  │            │ │
│  │          │ Inicial│   +    │   -    │        │ do Dia  │ Final  │            │ │
│  ├──────────┼────────┼────────┼────────┼────────┼─────────┼────────┤            │ │
│  │15/01/2024│  100   │  +50   │  -10   │  -20   │  +20    │  120   │  (Hoje)   │ │
│  │14/01/2024│   80   │  +30   │   -5   │  -15   │  +10    │  100   │            │ │
│  │13/01/2024│   70   │  +20   │  -10   │   0    │  +10    │   80   │            │ │
│  └──────────┴────────┴────────┴────────┴────────┴─────────┴────────┘            │ │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

**New Column:**
- "Gastos" column added between "Pontos -" and "Balanço do Dia"
- Values in orange color
- Shows "-{amount}" format or "0" if no expenses

### 4. Reports - Updated Statistics
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📈 Relatórios                                                                  │
│  [Última Semana] [Último Mês] [Tudo]                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   BLUE   │  │  GREEN   │  │   RED    │  │  ORANGE  │  │  PURPLE  │         │
│  │  Total   │  │ Pontos   │  │ Pontos   │  │  Total   │  │  Saldo   │         │
│  │   de     │  │Positivos │  │Negativos │  │   de     │  │   do     │         │
│  │Atividade │  │          │  │          │  │  Gastos  │  │ Período  │         │
│  │          │  │          │  │          │  │          │  │          │         │
│  │    25    │  │   +150   │  │   -30    │  │   -50    │  │    70    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Changes:**
- Grid changed from 4 to 5 columns
- New "Total de Gastos" card in orange
- "Saldo do Período" now includes expense calculation

### 5. Reports - Expense History Section (NEW)
```
┌─────────────────────────────────────────────────────────────────┐
│  Histórico de Gastos                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Sorvete                                           -10    │  │
│  │  15/01/2024                                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Brinquedo                                         -15    │  │
│  │  14/01/2024                                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Lanche                                            -8     │  │
│  │  13/01/2024                                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Separate section below activity history
- Same scrollable container (max-height)
- Filtered by selected period
- Orange color for expense amounts

## Color Coding System

The application now uses a comprehensive color system:

| Color  | Usage | Hex Codes |
|--------|-------|-----------|
| 🔵 Blue | Saldo Inicial do Dia | from-blue-500 to-blue-600 |
| 🟢 Green | Pontos Positivos | from-green-500 to-green-600 |
| 🔴 Red | Pontos Negativos | from-red-500 to-red-600 |
| 🟠 **Orange** | **Gastos (NEW)** | **from-orange-500 to-orange-600** |
| 🟣 Purple | Saldo Atual/Final | from-purple-500 to-purple-600 |

This creates clear visual separation and makes it easy to distinguish between:
- Points earned (green)
- Points lost (red)
- Points spent (orange)
- Balances (blue/purple)

## Responsive Design

All new elements maintain responsive design:
- **Desktop (lg)**: 5 columns in dashboard/reports
- **Tablet (md)**: 2 columns
- **Mobile**: 1 column (stacked vertically)

The expense modal is centered and responsive:
- Max width: 28rem (448px)
- Margin: 1rem on small screens
- Full viewport overlay

## User Workflow

1. **View Dashboard** → See 5 cards including "Gastos do Dia"
2. **Click "+ Adicionar Gasto"** → Modal opens
3. **Fill form** → Description, amount, date
4. **Click "Salvar"** → Expense saved, modal closes
5. **See updates** → Card updates, list shows new expense, balance recalculates
6. **View history** → Scroll to see historical expenses
7. **Check reports** → See expense statistics and full history
