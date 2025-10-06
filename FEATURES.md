# Sistema de Pontos para Crianças - Guia de Funcionalidades

## 📋 Visão Geral

Este sistema foi desenvolvido para ajudar pais a gerenciar e incentivar comportamentos positivos de seus filhos através de um sistema de pontuação.

## 🎯 Funcionalidades Implementadas

### 1. Gerenciamento de Atividades

#### No Dashboard
- **Visualização de Pontos**: Saldo inicial, pontos ganhos e total de pontos
- **Data Atual**: Mostra o dia da semana e data (DD/MM/AAAA)
- **Atividades Recentes**: Lista das últimas atividades registradas
- **Remover Registros**: Cada atividade possui um botão 🗑️ para remoção

#### Na Aba Atividades
- **Calendário para Seleção de Data**: 
  - Campo para selecionar a data de registro
  - Permite registrar atividades em dias passados
  - Data padrão é sempre o dia atual
  - Informação clara sobre a data selecionada

- **Atribuir Pontos**: 
  - Clique em qualquer atividade para registrá-la
  - Os pontos são atribuídos para a data selecionada
  - Confirmação visual após registro

- **Registros Recentes**:
  - Seção mostrando os últimos 20 registros
  - Cada registro mostra: nome, data/hora, pontos e categoria
  - Botão "Remover" para excluir registros

#### Na Aba Configurações
- **Gerenciar Atividades Personalizadas**:
  - ➕ Adicionar novas atividades
  - ✏️ Editar nome e pontos
  - 🗑️ Excluir atividades
  - ⬆️⬇️ Mover atividades (botões ou drag-and-drop)
  
- **Drag-and-Drop**:
  - Arraste atividades para reordená-las
  - Funciona apenas dentro da mesma categoria
  - Ícone ⋮⋮ indica área de arrasto
  - Feedback visual durante o arrasto

### 2. Categorias de Atividades

#### Atividades Positivas (Multiplicador: 1x)
1. Chegar cedo na escola
2. Chegar bem cedo na escola (2 pontos base)
3. Fazer a tarefa sozinho (2 pontos)
4. Ajudar o irmão a fazer a tarefa (2 pontos)
5. Comer toda a refeição
6. Comer frutas ou verduras
7. Dormir cedo
8. Limpeza e saúde
9. Organização

#### Atividades Especiais (Multiplicador: 50x)
1. Ler um livro
2. Tirar nota 10
3. Viagem - 'se virar'
4. Comida especial
5. Coragem
6. Ações especiais

#### Atividades Negativas (Multiplicador: 1x)
1. Chegar atrasado na escola (-1 ponto)
2. Não fazer a tarefa (-2 pontos)
3. Não comer toda a refeição (-1 ponto)
4. Brigar com o irmão (-1 ponto)
5. Dar trabalho para dormir (-1 ponto)
6. Desobedecer os adultos (-2 pontos)
7. Falar bobeira (-1 ponto)
8. Gritar (-1 ponto)

#### Atividades Graves (Multiplicador: 100x)
1. Bater no irmão (-1 ponto)
2. Falar palavrão (-1 ponto)
3. Mentir (-2 pontos)

### 3. Configurações do Sistema

#### Dados do Pai/Mãe
- **Nome do Pai/Mãe**: Campo para registrar o nome do responsável
- **Sexo**: Opções: Masculino, Feminino, Outro
- **Data de Início do App**: Quando começou a usar o sistema
- Botão para salvar/atualizar dados

#### Configurações da Criança
- **Saldo Inicial**: Pontos iniciais que a criança começa
- **Data de Início**: Data de início do acompanhamento da criança
- Configurável separadamente para cada criança (Luiza e Miguel)

#### Multiplicadores de Pontos
- Configuráveis para cada categoria
- Valores padrão: Positivos (1x), Especiais (50x), Negativos (1x), Graves (100x)

#### Backup e Importação
- **Exportar Dados**: Baixa arquivo JSON com todos os dados
- **Importar Dados**: Restaura dados de backup anterior

### 4. Fluxo de Uso

#### Para Registrar uma Atividade:
1. Vá para a aba "Atividades"
2. (Opcional) Altere a data se quiser registrar para outro dia
3. Clique na atividade desejada
4. Confirme o registro

#### Para Remover um Registro:
1. Opção 1: Na aba "Dashboard", clique no botão 🗑️ ao lado da atividade
2. Opção 2: Na aba "Atividades", vá para "Registros Recentes" e clique em "Remover"

#### Para Gerenciar Atividades Personalizadas:
1. Vá para a aba "Configurações"
2. Role até "Gerenciar Atividades Personalizadas"
3. Use os botões para adicionar, editar, excluir ou reordenar
4. Ou arraste e solte para reordenar

#### Para Configurar o Sistema Inicial:
1. Vá para a aba "Configurações"
2. Preencha "Dados do Pai/Mãe"
3. Selecione uma criança
4. Configure "Saldo Inicial" e "Data de Início" para a criança
5. Salve as configurações

## 🔧 Requisitos Técnicos

### Stack Tecnológico
- **Frontend**: Next.js 15 com TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL (Neon) com Drizzle ORM
- **Deployment**: Vercel

### APIs Disponíveis
- `/api/children` - Gerenciamento de crianças
- `/api/activities` - Registro de atividades
- `/api/custom-activities` - Atividades personalizadas
- `/api/parent` - Dados do pai/mãe
- `/api/settings` - Configurações gerais
- `/api/init` - Inicialização do banco de dados
- `/api/import` - Importação de dados

## 📱 Interface do Usuário

### Abas Principais
1. **📊 Dashboard**: Visão geral de pontos e atividades recentes
2. **🎯 Atividades**: Registro de atividades com calendário
3. **📈 Relatórios**: Estatísticas e gráficos
4. **⚙️ Configurações**: Gerenciamento completo do sistema

### Seletor de Criança
- Botões para alternar entre Luiza e Miguel
- Dados são mantidos separadamente para cada criança

## 💡 Dicas de Uso

1. **Registros Passados**: Use o calendário para registrar atividades esquecidas
2. **Organização**: Mantenha as atividades ordenadas conforme sua preferência
3. **Backup Regular**: Exporte seus dados periodicamente
4. **Multiplicadores**: Ajuste os multiplicadores conforme a importância das categorias
5. **Saldo Inicial**: Útil para migrar de outro sistema ou dar um "boost" inicial

## 🚀 Próximos Passos (Opcional)

- Gráficos de evolução por período
- Notificações e lembretes
- Sistema de recompensas/metas
- Relatórios personalizados
- App mobile nativo

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação técnica ou entre em contato com o desenvolvedor.

---

**Versão**: 2.0.0  
**Última Atualização**: 2024
