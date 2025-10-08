# Dashboard com Histórico Diário - Documentação de Implementação

## Visão Geral

Esta implementação adiciona um histórico diário completo ao dashboard, permitindo visualizar a evolução dos pontos de cada criança desde a data inicial configurada até o dia atual.

## Requisitos Atendidos

✅ **1. Saldo inicial do cálculo é o saldo definido nas configurações**
   - O cálculo inicia com o `initialBalance` configurado para cada criança

✅ **2. Para cada dia, o saldo inicial é o saldo final do dia anterior**
   - O algoritmo calcula dia a dia, carregando o saldo final de um dia como saldo inicial do próximo

✅ **3. Dashboard mostra dados diários completos**
   - Saldo inicial do dia
   - Pontos positivos do dia
   - Pontos negativos do dia  
   - Saldo final do dia
   - Saldo atual (saldo final do último dia)

✅ **4. Histórico exibido em tabela e gráfico**
   - Tabela com dados detalhados
   - Gráfico de barras mostrando evolução
   - Botões para alternar entre visualizações

✅ **5. Dados calculados desde a data inicial de cada criança**
   - Usa `startDate` configurado ou data da primeira atividade
   - Calcula todos os dias até hoje

✅ **6. Saldo atual reflete todas as movimentações**
   - Saldo atual é calculado acumulando todas as atividades desde o início

✅ **7. Layout permite visualização tabular e gráfica**
   - Interface com toggle entre tabela e gráfico
   - Ambas as visualizações mostram os mesmos dados

## Arquivos Modificados/Criados

### 1. `lib/balance-calculator.ts` (NOVO)
Biblioteca de cálculo de saldos diários com as seguintes funções:

#### `calculateDailyBalances(activities, childInitialBalance, childStartDate)`
Função principal que calcula o saldo diário de uma criança.

**Parâmetros:**
- `activities`: Array de todas as atividades da criança
- `childInitialBalance`: Saldo inicial configurado
- `childStartDate`: Data de início configurada (opcional)

**Retorna:** Array de objetos `DailyBalance` com:
```typescript
{
  date: Date;              // Data do dia
  dateString: string;      // Data formatada (DD/MM/YYYY)
  initialBalance: number;  // Saldo inicial do dia
  positivePoints: number;  // Pontos positivos ganhos no dia
  negativePoints: number;  // Pontos negativos perdidos no dia
  finalBalance: number;    // Saldo final do dia
  activities: any[];       // Atividades do dia
}
```

**Algoritmo:**
1. Determina data inicial (usa `startDate` ou data da primeira atividade ou hoje)
2. Normaliza datas para timezone de Fortaleza
3. Itera dia a dia desde a data inicial até hoje
4. Para cada dia:
   - Filtra atividades do dia
   - Calcula pontos positivos (soma de atividades com points > 0)
   - Calcula pontos negativos (soma absoluta de atividades com points < 0)
   - Calcula saldo final = saldo inicial + positivos - negativos
   - Usa saldo final como saldo inicial do próximo dia

#### `getCurrentBalance(dailyBalances)`
Retorna o saldo atual (saldo final do último dia).

#### `getTodayBalance(dailyBalances)`
Retorna os dados do dia de hoje.

### 2. `components/Dashboard.tsx` (MODIFICADO)

#### Mudanças Principais:

**Estado adicionado:**
```typescript
const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
const [showChart, setShowChart] = useState(false);
```

**Cálculo de saldos ao carregar atividades:**
```typescript
const balances = calculateDailyBalances(
  data,
  childData.initialBalance || 0,
  childData.startDate ? new Date(childData.startDate) : null
);
setDailyBalances(balances);
```

**Obtenção de dados do dia atual:**
```typescript
const todayBalance = getTodayBalance(dailyBalances);
const initialBalance = todayBalance?.initialBalance || childData.initialBalance || 0;
const positivePointsToday = todayBalance?.positivePoints || 0;
const negativePointsToday = todayBalance?.negativePoints || 0;
const currentBalance = getCurrentBalance(dailyBalances);
```

#### Nova Seção de Histórico

**Botões de alternância:**
```tsx
<button onClick={() => setShowChart(false)}>📋 Tabela</button>
<button onClick={() => setShowChart(true)}>📈 Gráfico</button>
```

**Visualização de Tabela:**
- Colunas: Data, Saldo Inicial, Pontos +, Pontos -, Balanço do Dia, Saldo Final
- Dados em ordem reversa (mais recente primeiro)
- Dia atual destacado com fundo azul
- Cores para valores positivos/negativos

**Visualização de Gráfico:**
- Gráfico de barras verticais
- Altura das barras proporcional ao saldo final
- Cores:
  - Azul: Dia atual
  - Verde: Dias com balanço positivo
  - Vermelho: Dias com balanço negativo
  - Cinza: Dias sem mudança
- Tooltip ao passar o mouse mostrando detalhes
- Eixo X mostra datas (a cada 5 dias se >15 dias)
- Legenda explicativa

## Exemplos de Cálculo

### Exemplo 1: Cálculo Básico
```
Criança: João
Saldo Inicial: 100 pontos
Data Inicial: 01/01/2024

Atividades:
- 01/01/2024 10h00: +10 pontos (Fez lição)
- 01/01/2024 15h00: -3 pontos (Brigou)
- 02/01/2024 09h00: +5 pontos (Ajudou em casa)

Resultado:
┌────────────┬───────────────┬──────────┬──────────┬──────────────┬─────────────┐
│ Data       │ Saldo Inicial │ Pontos + │ Pontos - │ Balanço Dia  │ Saldo Final │
├────────────┼───────────────┼──────────┼──────────┼──────────────┼─────────────┤
│ 01/01/2024 │ 100           │ +10      │ -3       │ +7           │ 107         │
│ 02/01/2024 │ 107           │ +5       │ 0        │ +5           │ 112         │
│ 03/01/2024 │ 112           │ 0        │ 0        │ 0            │ 112         │
└────────────┴───────────────┴──────────┴──────────┴──────────────┴─────────────┘

Saldo Atual: 112 pontos
```

### Exemplo 2: Com Multiplicadores
```
Criança: Maria
Saldo Inicial: 50 pontos
Data Inicial: 01/01/2024

Atividades:
- 01/01/2024: +10 pontos × 2 (multiplicador especial) = +20
- 01/01/2024: -5 pontos × 1 (multiplicador normal) = -5

Resultado Dia 01/01:
- Saldo Inicial: 50
- Pontos Positivos: +20
- Pontos Negativos: -5
- Saldo Final: 50 + 20 - 5 = 65
```

## Aspectos Técnicos

### Timezone
Todos os cálculos usam o timezone `America/Fortaleza` (UTC-3) para garantir consistência com o restante do sistema.

### Performance
- O cálculo é feito uma vez ao carregar as atividades
- Resultado armazenado em estado React
- Re-cálculo apenas quando atividades mudam

### Responsividade
- Tabela com scroll horizontal em telas pequenas
- Gráfico se ajusta ao tamanho da tela
- Layout mobile-friendly

## Testes

Criado arquivo `__tests__/balance-calculator.test.ts` com testes para:
- ✅ Cálculo sem atividades
- ✅ Cálculo com atividades positivas
- ✅ Cálculo com atividades negativas
- ✅ Cálculo com atividades mistas
- ✅ Carregamento de saldo para dia seguinte
- ✅ Obtenção de saldo atual
- ✅ Tratamento de array vazio

Todos os testes passam com sucesso.

## Próximos Passos Potenciais

1. **Filtro de período**: Permitir visualizar apenas últimos 7/30/90 dias
2. **Exportação**: Exportar tabela em PDF ou CSV
3. **Gráfico de linha**: Adicionar visualização alternativa com linha de tendência
4. **Metas**: Mostrar linha de meta no gráfico
5. **Comparação**: Comparar evolução de múltiplas crianças

## Conclusão

A implementação atende completamente aos requisitos solicitados, fornecendo:
- Cálculo correto de saldos diários
- Visualização em tabela e gráfico
- Interface intuitiva e responsiva
- Código testado e documentado
