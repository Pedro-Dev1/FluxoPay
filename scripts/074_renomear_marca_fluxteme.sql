-- Troca de marca FluxoPay -> Fluxteme nos textos que já estão gravados no
-- banco (avisos do 067 e notificações in-app). O código e os e-mails já saem
-- com o nome novo; isto só corrige o que foi salvo antes.
--
-- Não mexe em e-mails de login (ex.: a conta Super Admin continua com o
-- mesmo e-mail) nem em ids.

-- PASSO 1 — preview: quantas linhas serão alteradas
select 'atualizacoes' as tabela, count(*) from atualizacoes
where titulo ilike '%fluxopay%' or subtitulo ilike '%fluxopay%' or descricao ilike '%fluxopay%' or cta_texto ilike '%fluxopay%'
union all
select 'notificacoes', count(*) from notificacoes
where titulo ilike '%fluxopay%' or mensagem ilike '%fluxopay%' or cta_texto ilike '%fluxopay%';

-- PASSO 2 — aplicar
update atualizacoes set
  titulo    = regexp_replace(titulo,    'fluxopay', 'Fluxteme', 'gi'),
  subtitulo = regexp_replace(subtitulo, 'fluxopay', 'Fluxteme', 'gi'),
  descricao = regexp_replace(descricao, 'fluxopay', 'Fluxteme', 'gi'),
  cta_texto = regexp_replace(cta_texto, 'fluxopay', 'Fluxteme', 'gi')
where titulo ilike '%fluxopay%' or subtitulo ilike '%fluxopay%' or descricao ilike '%fluxopay%' or cta_texto ilike '%fluxopay%';

update notificacoes set
  titulo    = regexp_replace(titulo,    'fluxopay', 'Fluxteme', 'gi'),
  mensagem  = regexp_replace(mensagem,  'fluxopay', 'Fluxteme', 'gi'),
  cta_texto = regexp_replace(cta_texto, 'fluxopay', 'Fluxteme', 'gi')
where titulo ilike '%fluxopay%' or mensagem ilike '%fluxopay%' or cta_texto ilike '%fluxopay%';
