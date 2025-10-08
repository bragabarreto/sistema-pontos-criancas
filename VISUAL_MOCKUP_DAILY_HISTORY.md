# Dashboard com Histórico Diário - Mockup Visual

## 1. Resumo do Dia Atual (Já Existente - Mantido)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Dashboard - João                                                      │
│ Quinta-feira - 08/01/2025                      🕐 Horário: 14:35:42     │
│ ℹ️ As atribuições imediatas são referentes ao dia em curso.             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Saldo Inicial    │ │ Pontos Positivos │ │ Pontos Negativos │ │ Saldo Atual      │
│ do Dia           │ │ Hoje             │ │ Hoje             │ │                  │
│                  │ │                  │ │                  │ │                  │
│      107         │ │      +25         │ │      -8          │ │      124         │
│                  │ │                  │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
   (Azul)              (Verde)              (Vermelho)            (Roxo)
```

## 2. Novo Componente: Histórico Diário de Pontos

### 2.1 Cabeçalho com Toggle

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Histórico Diário de Pontos                    [📋 Tabela] [📈 Gráfico]│
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Visualização em Tabela (Modo Padrão)

```
┌──────────────┬───────────────┬──────────┬──────────┬──────────────┬─────────────┐
│ Data         │ Saldo Inicial │ Pontos + │ Pontos - │ Balanço Dia  │ Saldo Final │
├──────────────┼───────────────┼──────────┼──────────┼──────────────┼─────────────┤
│ 08/01/2025   │ 107           │ +25      │ -8       │ +17          │ 124         │
│ (Hoje)       │               │          │          │              │             │
│ [AZUL CLARO] │               │ [VERDE]  │ [VERMELHO│ [VERDE]      │ [NEGRITO]   │
├──────────────┼───────────────┼──────────┼──────────┼──────────────┼─────────────┤
│ 07/01/2025   │ 115           │ +0       │ -8       │ -8           │ 107         │
│              │               │          │          │ [VERMELHO]   │             │
├──────────────┼───────────────┼──────────┼──────────┼──────────────┼─────────────┤
│ 06/01/2025   │ 100           │ +20      │ -5       │ +15          │ 115         │
│              │               │ [VERDE]  │ [VERMELHO│ [VERDE]      │             │
├──────────────┼───────────────┼──────────┼──────────┼──────────────┼─────────────┤
│ 05/01/2025   │ 100           │ +10      │ -10      │ 0            │ 100         │
│              │               │ [VERDE]  │ [VERMELHO│ [CINZA]      │             │
├──────────────┼───────────────┼──────────┼──────────┼──────────────┼─────────────┤
│ 04/01/2025   │ 100           │ +0       │ 0        │ 0            │ 100         │
│              │               │          │          │              │             │
└──────────────┴───────────────┴──────────┴──────────┴──────────────┴─────────────┘
```

**Características da Tabela:**
- ✅ Dia atual destacado com fundo azul claro
- ✅ Ordem reversa (mais recente primeiro)
- ✅ Cores semânticas:
  - Verde: Valores positivos
  - Vermelho: Valores negativos
  - Cinza: Valores neutros
- ✅ Scroll horizontal em dispositivos móveis
- ✅ Coluna "Balanço do Dia" mostra a diferença líquida

### 2.3 Visualização em Gráfico

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Evolução do Saldo ao Longo do Tempo                                     │
│                                                                          │
│ 150│                                                                     │
│    │                                            ██                       │
│ 125│                          ██       ██       ██                       │
│    │                          ██       ██       ██                       │
│ 100│  ██       ██       ██    ██       ██       ██                       │
│    │  ██       ██       ██    ██       ██       ██                       │
│  75│  ██       ██       ██    ██       ██       ██                       │
│    │  ██       ██       ██    ██       ██       ██                       │
│  50│  ██       ██       ██    ██       ██       ██                       │
│    │  ██       ██       ██    ██       ██       ██                       │
│  25│  ██       ██       ██    ██       ██       ██                       │
│    │  ██       ██       ██    ██       ██       ██                       │
│   0├──┴────────┴────────┴─────┴────────┴────────┴───────────────────────┤
│     04/01   05/01   06/01  07/01   08/01  (hoje)                        │
│                                                                          │
│   Legend:  ██ Dia Positivo   ██ Dia Negativo   ██ Hoje                 │
│           (Verde)           (Vermelho)        (Azul)                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Características do Gráfico:**
- ✅ Barras verticais mostrando saldo final de cada dia
- ✅ Altura proporcional ao valor
- ✅ Cores por tipo de dia:
  - Azul: Dia atual (destaque)
  - Verde: Dias com balanço positivo
  - Vermelho: Dias com balanço negativo
  - Cinza: Dias sem mudança
- ✅ Tooltip ao passar mouse:
  ```
  ┌──────────────────┐
  │ 08/01/2025       │
  │ Saldo: 124       │
  │ Balanço: +17     │
  └──────────────────┘
  ```
- ✅ Eixo X mostra datas (otimizado para muitos dias)
- ✅ Legenda explicativa
- ✅ Responsivo

## 3. Layout Completo do Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SISTEMA DE PONTUAÇÃO                               │
│                 Luiza e Miguel - Incentivando bons comportamentos!       │
├─────────────────────────────────────────────────────────────────────────┤
│  [Dashboard] [Atividades] [Relatórios] [Configurações]                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ 📊 Dashboard - João                                              │    │
│ │ Quinta-feira - 08/01/2025            🕐 Horário: 14:35:42       │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│ │ Saldo    │ │ Pontos + │ │ Pontos - │ │ Saldo    │                    │
│ │ Inicial  │ │ Hoje     │ │ Hoje     │ │ Atual    │                    │
│ │   107    │ │   +25    │ │   -8     │ │   124    │                    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘                    │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Atividades Recentes                                              │    │
│ │ • Fez lição de casa               14:30        +10 [positivos]   │    │
│ │ • Ajudou a lavar louça            13:15         +5 [positivos]   │    │
│ │ • Brigou com irmão                12:45         -8 [negativos]   │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ 📊 Histórico Diário de Pontos        [📋 Tabela] [📈 Gráfico]   │    │
│ ├──────────────────────────────────────────────────────────────────┤    │
│ │                                                                  │    │
│ │  [TABELA OU GRÁFICO AQUI]                                       │    │
│ │                                                                  │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. Responsividade Mobile

### Em telas pequenas (< 768px):

```
┌─────────────────────┐
│ Dashboard - João     │
│ Qui - 08/01/2025     │
│ 🕐 14:35:42         │
└─────────────────────┘

┌─────────────────────┐
│ Saldo Inicial       │
│      107            │
└─────────────────────┘

┌─────────────────────┐
│ Pontos + Hoje       │
│      +25            │
└─────────────────────┘

┌─────────────────────┐
│ Pontos - Hoje       │
│      -8             │
└─────────────────────┘

┌─────────────────────┐
│ Saldo Atual         │
│      124            │
└─────────────────────┘

┌─────────────────────┐
│ Histórico Diário    │
│ [Tabela] [Gráfico]  │
│                     │
│ [Scroll horizontal] │
│ para a tabela       │
└─────────────────────┘
```

## 5. Estados da Interface

### Estado: Carregando
```
┌──────────────────────────────────┐
│ 📊 Histórico Diário de Pontos    │
│                                  │
│     ⌛ Carregando...             │
│                                  │
└──────────────────────────────────┘
```

### Estado: Sem Dados
```
┌──────────────────────────────────┐
│ 📊 Histórico Diário de Pontos    │
│                                  │
│  Nenhum histórico disponível     │
│                                  │
└──────────────────────────────────┘
```

### Estado: Dados Carregados (Tabela)
```
[Tabela completa com dados]
```

### Estado: Dados Carregados (Gráfico)
```
[Gráfico de barras com dados]
```

## 6. Cores e Estilo

### Paleta de Cores:
- **Azul**: `#3B82F6` (Saldo Inicial, Hoje destacado)
- **Verde**: `#10B981` (Pontos Positivos)
- **Vermelho**: `#EF4444` (Pontos Negativos)
- **Roxo**: `#8B5CF6` (Saldo Atual)
- **Cinza**: `#6B7280` (Valores neutros)

### Tipografia:
- Títulos: Font Bold
- Valores numéricos: Font Mono (para alinhamento)
- Texto normal: Sans-serif padrão

### Espaçamento:
- Padding interno: 1.5rem (24px)
- Gap entre elementos: 1rem (16px)
- Border radius: 0.5rem (8px)

## 7. Interatividade

### Hover nos itens da tabela:
- Linha muda para fundo levemente cinza

### Hover nas barras do gráfico:
- Opacidade reduz para 80%
- Tooltip aparece

### Click nos botões Tabela/Gráfico:
- Botão ativo: Azul com texto branco
- Botão inativo: Cinza claro com texto escuro
- Transição suave
