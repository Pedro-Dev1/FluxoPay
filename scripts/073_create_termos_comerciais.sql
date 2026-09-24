-- Termos comerciais (política comercial PAG) com versões controladas pelo
-- Super Admin. Diferente de user_terms_acceptance (termos de uso, versão fixa
-- no código, para todo mundo): aqui o texto vive no banco, só Adm e
-- Financeiro das carteiras precisam aceitar, e cada pessoa aceita por si.
--
-- Ciclo de uma versão:
--   rascunho   publicado_em null                -> editável, ninguém vê
--   em vigor   publicado_em set, arquivado_em null -> bloqueia Adm/Financeiro até aceitarem
--   arquivada  arquivado_em set                 -> não é mais exigida; histórico preservado
-- Só uma versão em vigor por vez. Publicada, o texto não muda mais: para
-- alterar, cria-se uma versão nova (e todos aceitam de novo).

-- PASSO 1 — tabelas
create table if not exists termos_comerciais (
  id uuid primary key default gen_random_uuid(),
  versao text not null unique,
  titulo text not null,
  conteudo text not null,
  -- sha256 do conteúdo no momento da publicação; copiado em cada aceite
  -- como prova de qual texto exato a pessoa aceitou.
  conteudo_sha256 text,
  publicado_em timestamptz,
  arquivado_em timestamptz,
  criado_por uuid references colaboradores(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists termos_comerciais_um_em_vigor
  on termos_comerciais ((true))
  where publicado_em is not null and arquivado_em is null;

-- Registro append-only: cada resposta (aceite ou recusa) é uma linha nova,
-- nunca sobrescrita. A situação atual de uma pessoa é a linha mais recente.
create table if not exists termos_comerciais_respostas (
  id uuid primary key default gen_random_uuid(),
  termo_id uuid not null references termos_comerciais(id) on delete restrict,
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  aceito boolean not null,
  conteudo_sha256 text not null,
  ip_address varchar(45),
  user_agent text,
  respondido_em timestamptz not null default now()
);

create index if not exists idx_tc_respostas_termo on termos_comerciais_respostas(termo_id, colaborador_id, respondido_em desc);
create index if not exists idx_tc_respostas_tenant on termos_comerciais_respostas(tenant_id);

-- Acesso só pelo service role (mesmo padrão de user_terms_acceptance).
alter table termos_comerciais disable row level security;
alter table termos_comerciais_respostas disable row level security;

-- PASSO 2 — versão 1.0 como RASCUNHO. Não bloqueia ninguém até o Super
-- Admin revisar e clicar em "Publicar versão" em /admin/termos.
insert into termos_comerciais (versao, titulo, conteudo)
values (
  '1.0',
  'Resumo da Política Comercial · PAG — Prestador Ativo Gerenciado',
  $termo$## 1. Unidade de cobrança
O Fluxteme cobra por PAG — Prestador Ativo Gerenciado: cada prestador mantido em condição ativa e gerenciada na plataforma. Usuários administrativos, gestores e aprovadores não geram cobrança adicional.

## 2. Modelo de capacidade contratada
Você contrata uma capacidade mensal de PAGs e administra livremente sua base dentro desse limite — ativação, inativação e substituição — sem necessidade de nova licença a cada alteração. A mensalidade corresponde à capacidade contratada, não ao uso diário efetivo.

## 3. Tabela oficial
| Capacidade | R$/dia/PAG | Mensalidade |
|---|---|---|
| 10 PAGs | 1,99 | R$ 597,00 |
| 20 PAGs | 1,79 | R$ 1.074,00 |
| 40 PAGs | 1,59 | R$ 1.908,00 |
| 60 PAGs | 1,39 | R$ 2.502,00 |
| 80 PAGs | 1,19 | R$ 2.856,00 |
| 120 PAGs (piso) | 0,99 | R$ 3.564,00 |

Acima de 120 PAGs: Mensalidade = R$ 3.564,00 + [(PAGs − 120) × R$ 29,70], mantendo o piso de R$ 0,99/dia por PAG adicional.

## 4. Módulos adicionais
Implantação, integrações, financeiro, jurídico, SST/EHS, fiscal/contábil, BI, IA, SSO e white-label não estão incluídos na capacidade PAG e podem ser objeto de proposta específica.

## 5. Vigência, reajuste e pagamento
Cobrança antecipada por capacidade contratada: o pagamento do ciclo é feito no início do período, e o acesso é liberado ou renovado mediante confirmação do pagamento. Reajuste anual recomendado pelo IPCA acumulado, salvo condição específica registrada em contrato. Descontos abaixo da tabela pública seguem alçadas de aprovação internas do Fluxteme e não constituem direito permanente sem previsão expressa.

## 6. Natureza deste aceite
Este é um aceite eletrônico simples (clickwrap) dos termos comerciais resumidos acima, para fins de formalização inicial da relação comercial. Ele não substitui o instrumento contratual definitivo (contrato ou aditivo), que será enviado separadamente para assinatura com validade jurídica plena.$termo$
)
on conflict (versao) do nothing;
