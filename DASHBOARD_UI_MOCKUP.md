# Dashboard UI Mockup

## Complete Dashboard View

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                          📊 Dashboard - Luiza                                 ║
║                                                                               ║
║  Segunda-feira - 07/10/2024                          🕐 Horário de Fortaleza  ║
║                                                              15:30:45         ║
║  ℹ️ As atribuições imediatas são referentes ao dia em curso.                  ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┏━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━┓
┃                 ┃  ┃                 ┃  ┃                 ┃  ┃                 ┃
┃  Saldo Inicial  ┃  ┃ Pontos Positivos┃  ┃ Pontos Negativos┃  ┃  Saldo Atual    ┃
┃     do Dia      ┃  ┃     (Hoje)      ┃  ┃     (Hoje)      ┃  ┃                 ┃
┃                 ┃  ┃                 ┃  ┃                 ┃  ┃                 ┃
┃      100        ┃  ┃      +25        ┃  ┃       -8        ┃  ┃      117        ┃
┃                 ┃  ┃                 ┃  ┃                 ┃  ┃                 ┃
┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━┛
   🔵 BLUE             🟢 GREEN             🔴 RED               🟣 PURPLE
 (from-blue-500)    (from-green-500)     (from-red-500)      (from-purple-500)
  (to-blue-600)      (to-green-600)       (to-red-600)        (to-purple-600)


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         Atividades Recentes                                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│ Fazer a tarefa sozinho                                              +10      │
│ 07/10/2024 às 14:30                                            positivos     │
│                                                                          🗑️   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Comer toda a refeição                                                +5      │
│ 07/10/2024 às 13:15                                            positivos     │
│                                                                          🗑️   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Chegar atrasado na escola                                            -3      │
│ 07/10/2024 às 08:15                                            negativos     │
│                                                                          🗑️   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Não fazer a tarefa                                                   -5      │
│ 06/10/2024 às 20:30                                            negativos     │
│                                                                          🗑️   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Mobile View (Single Column)

```
╔════════════════════════════════════════╗
║    📊 Dashboard - Luiza                ║
║                                        ║
║  Segunda-feira - 07/10/2024            ║
║           🕐 15:30:45                  ║
╚════════════════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     Saldo Inicial do Dia             ┃
┃                                      ┃
┃            100                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
              🔵 BLUE

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Pontos Positivos (Hoje)            ┃
┃                                      ┃
┃            +25                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
              🟢 GREEN

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Pontos Negativos (Hoje)            ┃
┃                                      ┃
┃            -8                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
              🔴 RED

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃       Saldo Atual                    ┃
┃                                      ┃
┃            117                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
              🟣 PURPLE

╔════════════════════════════════════════╗
║     Atividades Recentes                ║
╚════════════════════════════════════════╝

┌────────────────────────────────────────┐
│ Fazer a tarefa sozinho          +10   │
│ 07/10/2024 às 14:30       positivos   │
│                                   🗑️   │
└────────────────────────────────────────┘
...
```

## Key Visual Elements

### Color Scheme
- **Blue Banner**: Neutral starting point (initial balance)
- **Green Banner**: Positive achievements (good behavior)
- **Red Banner**: Areas for improvement (negative behavior) ⭐ NEW!
- **Purple Banner**: Final result (calculated balance)

### Typography
- **Banner titles**: Small, semibold, white text
- **Point values**: 3xl, bold, white text
- **Sign indicators**: "+" for positive, "-" for negative

### Layout
- **Desktop**: 4-column grid (responsive using Tailwind's `md:grid-cols-4`)
- **Mobile**: Single column stack
- **Gap**: Consistent 4-unit spacing between banners

### Accessibility
- High contrast white text on colored backgrounds
- Clear visual hierarchy
- Semantic color coding (green=good, red=warning)
- Screen reader friendly labels

## Calculation Logic Visualization

```
Initial Balance:    100 points
                     ↓
Today's Activities:
  ✅ +10 (homework)
  ✅ +15 (ate vegetables × multiplier)
     = +25 total positive
  ❌ -3 (late to school)
  ❌ -5 (didn't clean room)
     = -8 total negative
                     ↓
Current Balance = 100 + 25 - 8 = 117 points
```

## User Experience Flow

1. **Parent opens Dashboard**
   → Sees 4 clear banners with today's breakdown

2. **Reads left to right**
   → Started with 100 points
   → Earned 25 positive points today
   → Lost 8 negative points today
   → Currently has 117 points

3. **Understands daily progress**
   → Can see specific behaviors (green vs red)
   → Can track improvement patterns
   → Can decide on rewards/consequences

4. **Reviews recent activities**
   → Sees what led to the points
   → Can delete entries if needed
   → Can add more activities

## Benefits of New Design

✅ **Clear separation** of positive and negative behavior
✅ **Daily focus** rather than all-time cumulative
✅ **Visual feedback** through color coding
✅ **Accurate calculation** matching business requirements
✅ **Responsive** works on all screen sizes
✅ **Intuitive** no explanation needed
