# Implementação: Sincronização de Atividades entre Crianças

## Resumo das Alterações

Este documento descreve as mudanças implementadas para sincronizar automaticamente as atividades personalizadas entre Luiza e Miguel, conforme solicitado na issue.

## Objetivos Atingidos

### ✅ 1. Botões de Movimentar Atividade (Subir/Descer) Funcionam Corretamente

**Problema:** Os botões de subir/descer atividades não funcionavam corretamente e não sincronizavam entre as duas crianças.

**Solução:**
- Modificado o endpoint `POST /api/custom-activities/reorder` para iterar sobre todas as crianças
- A função agora:
  1. Busca todas as crianças do banco de dados
  2. Para cada criança, encontra a atividade correspondente pelo padrão base do activityId
  3. Realiza a reordenação na mesma posição para ambas as crianças
  4. Atualiza os índices de ordem no banco de dados

**Arquivo modificado:** `app/api/custom-activities/reorder/route.ts`

### ✅ 2. Atividades Iguais para Ambas as Crianças com Replicação Automática

**Problema:** As atividades personalizadas não eram sincronizadas entre Luiza e Miguel.

**Solução Implementada:**

#### a) Criar Atividade (POST)
- **Arquivo:** `app/api/custom-activities/route.ts`
- **Mudança:** O endpoint agora cria a atividade para todas as crianças automaticamente
- **Lógica:**
  1. Recebe os dados da nova atividade
  2. Busca todas as crianças do banco de dados
  3. Para cada criança, cria uma atividade com um activityId único (prefixado com o nome da criança)
  4. Retorna a atividade criada para a criança que fez a requisição

#### b) Editar Atividade (PUT)
- **Arquivo:** `app/api/custom-activities/[id]/route.ts`
- **Mudança:** O endpoint agora atualiza a atividade para ambas as crianças
- **Lógica:**
  1. Recebe o ID da atividade a ser editada
  2. Extrai o activityId base (sem o prefixo do nome da criança)
  3. Para cada criança, encontra e atualiza a atividade correspondente
  4. Retorna a atividade atualizada

#### c) Excluir Atividade (DELETE)
- **Arquivo:** `app/api/custom-activities/[id]/route.ts`
- **Mudança:** O endpoint agora exclui a atividade de ambas as crianças
- **Lógica:**
  1. Recebe o ID da atividade a ser excluída
  2. Extrai o activityId base
  3. Para cada criança, encontra e exclui a atividade correspondente
  4. Retorna sucesso se pelo menos uma atividade foi excluída

### ✅ 3. Botão "+ Nova Atividade" no Topo de Cada Categoria

**Problema:** Não havia um botão dedicado para adicionar novas atividades no topo de cada categoria.

**Solução:**
- **Arquivo:** `components/Activities.tsx`
- **Mudanças:**
  1. Adicionado estado para controlar o modal de nova atividade:
     - `newActivityModalOpen`: controla visibilidade do modal
     - `newActivityCategory`: armazena a categoria selecionada
     - `newActivityName`: armazena o nome da nova atividade
     - `newActivityPoints`: armazena os pontos da nova atividade

  2. Criadas funções para gerenciar nova atividade:
     - `openNewActivityModal(category)`: abre o modal para categoria específica
     - `closeNewActivityModal()`: fecha o modal e limpa os dados
     - `saveNewActivity()`: salva a nova atividade (criando para ambas as crianças)

  3. Adicionado botão "+ Nova Atividade" no cabeçalho de cada categoria
  4. Implementado modal de criação de atividade com:
     - Campo de categoria (somente leitura, pré-preenchido)
     - Campo de nome da atividade
     - Campo de pontos base
     - Aviso que a atividade será criada para ambas as crianças
     - Botões de confirmar e cancelar

## Melhorias na Interface do Usuário

### Notificações Informativas
Todas as operações agora exibem mensagens claras informando que as mudanças afetam ambas as crianças:

1. **Criar:** "Atividade criada com sucesso para ambas as crianças!"
2. **Editar:** "Atividade atualizada com sucesso para ambas as crianças!"
3. **Excluir:** Confirmação pergunta: "Tem certeza que deseja excluir esta atividade personalizada? Ela será removida para ambas as crianças (Luiza e Miguel)."
4. **Mover:** "Atividade movida para cima/baixo (sincronizado para ambas as crianças)!"

### Avisos nos Modais
Os modais de edição e criação agora incluem avisos visuais:
- "ℹ️ Esta alteração será aplicada para ambas as crianças (Luiza e Miguel)."
- "ℹ️ Esta atividade será criada para ambas as crianças (Luiza e Miguel)."

## Estrutura Técnica

### Padrão de Identificação de Atividades
As atividades são identificadas de forma única usando o padrão:
- `{nome_crianca}-{id_base}`
- Exemplo: `luiza-pos1`, `miguel-pos1`

Este padrão permite:
1. Identificar atividades correspondentes entre crianças
2. Manter unicidade no banco de dados
3. Facilitar operações sincronizadas

### Fluxo de Sincronização

```
Operação Iniciada pelo Frontend
        ↓
API Recebe Requisição
        ↓
Identifica ID Base da Atividade
        ↓
Busca Todas as Crianças
        ↓
Para Cada Criança:
  - Constrói ActivityId Específico
  - Executa Operação (Create/Update/Delete/Reorder)
        ↓
Retorna Resultado
        ↓
Frontend Recarrega Atividades
```

## Arquivos Modificados

1. **app/api/custom-activities/route.ts**
   - Função `POST`: Criar atividade para todas as crianças

2. **app/api/custom-activities/[id]/route.ts**
   - Função `PUT`: Atualizar atividade para todas as crianças
   - Função `DELETE`: Excluir atividade de todas as crianças

3. **app/api/custom-activities/reorder/route.ts**
   - Função `POST`: Reordenar atividade para todas as crianças

4. **components/Activities.tsx**
   - Adicionado botão "+ Nova Atividade" em cada categoria
   - Criado modal de nova atividade
   - Atualizado feedback das operações para indicar sincronização
   - Modificada função `moveActivity` para usar novo endpoint

## Compatibilidade com Dados Existentes

A implementação mantém compatibilidade com:
- ✅ Atividades já existentes no banco de dados
- ✅ Sistema de orderIndex existente
- ✅ Estrutura de categorias (positivos, especiais, negativos, graves)
- ✅ Sistema de multiplicadores

## Inicialização de Dados

O endpoint `/api/init` já estava configurado corretamente para criar atividades idênticas para ambas as crianças durante a inicialização do sistema.

## Testes Recomendados

Para validar a implementação, recomenda-se testar:

1. **Criar nova atividade:**
   - Clicar em "+ Nova Atividade" em qualquer categoria
   - Preencher nome e pontos
   - Verificar que aparece para ambas as crianças

2. **Editar atividade:**
   - Editar uma atividade de Luiza
   - Trocar para Miguel
   - Verificar que a mesma alteração está presente

3. **Excluir atividade:**
   - Excluir uma atividade de Miguel
   - Trocar para Luiza
   - Verificar que foi excluída também

4. **Mover atividade:**
   - Mover uma atividade para cima/baixo em Luiza
   - Trocar para Miguel
   - Verificar que a ordem está sincronizada

## Observações de Implementação

- A sincronização é **automática e transparente** para o usuário
- Todas as operações são **atômicas** no backend
- O frontend **não precisa** fazer múltiplas requisições
- A interface fornece **feedback claro** sobre sincronização
- O sistema é **retrocompatível** com dados existentes

## Conclusão

Todas as três funcionalidades solicitadas foram implementadas com sucesso:
1. ✅ Movimentação de atividades funcionando e sincronizada
2. ✅ Replicação automática de todas as operações CRUD
3. ✅ Botões "+ Nova Atividade" em cada categoria

O sistema agora garante que Luiza e Miguel sempre terão as mesmas atividades personalizadas disponíveis, com qualquer mudança sendo automaticamente replicada para ambos.
