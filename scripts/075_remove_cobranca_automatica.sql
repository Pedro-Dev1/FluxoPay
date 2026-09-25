-- Remoção da cobrança automática da plataforma (Pagar.me: webhook, cron
-- mensal e boleto por usuário ativo). O faturamento volta a ser só pelas
-- faturas manuais (/faturas), como era antes do 069.
--
-- Nada é apagado: faturas_plataforma e as colunas de faturamento em tenants
-- ficam como histórico. Este script só desativa o aviso que prometia o
-- boleto automático, que deixou de ser verdade.

-- PASSO 1 — preview
select id, titulo, status from atualizacoes
where titulo ilike '%boleto automaticamente%';

-- PASSO 2 — aplicar
update atualizacoes set status = 'INACTIVE'
where titulo ilike '%boleto automaticamente%' and status <> 'INACTIVE';
