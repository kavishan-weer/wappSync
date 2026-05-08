-- Phase 7: RAG for Policies and FAQ
-- Tables: documents, document_chunks (with pgvector)

-- Enable pgvector extension
create extension if not exists vector;
set search_path = public, extensions;

-- documents: uploaded PDF metadata
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  chunk_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- document_chunks: text chunks with embeddings
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  chunk_index integer not null default 0,
  embedding vector(768),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists documents_shop_id_idx
  on public.documents(shop_id);
create index if not exists document_chunks_document_id_idx
  on public.document_chunks(document_id);
create index if not exists document_chunks_shop_id_idx
  on public.document_chunks(shop_id);

-- Vector similarity search index (IVFFlat for performance)
-- Using cosine distance for Google Gemini embeddings
do $$
begin
  begin
    create index if not exists document_chunks_embedding_idx
      on public.document_chunks
      using ivfflat (embedding vector_cosine_ops)
      with (lists = 100);
  exception
    when undefined_object then
      raise notice 'Skipping vector similarity index because vector_cosine_ops is not available in this Supabase project.';
    when others then
      raise notice 'Skipping vector similarity index: %', sqlerrm;
  end;
end $$;

-- RLS
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

-- documents policies
create policy "Owners can manage their documents"
  on public.documents
  for all
  to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = documents.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = documents.shop_id
      and shops.owner_id = auth.uid()
  ));

-- document_chunks policies
create policy "Owners can manage their document chunks"
  on public.document_chunks
  for all
  to authenticated
  using (exists (
    select 1 from public.shops
    where shops.id = document_chunks.shop_id
      and shops.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shops
    where shops.id = document_chunks.shop_id
      and shops.owner_id = auth.uid()
  ));

-- Triggers for updated_at
drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row
  execute function public.set_updated_at();

-- Vector search function for RAG
create or replace function public.search_document_chunks(
  p_shop_id uuid,
  p_query_embedding vector(768),
  p_match_count integer default 5,
  p_match_threshold float default 0.7
)
returns table (
  id uuid,
  content text,
  document_id uuid,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
    select
      dc.id,
      dc.content,
      dc.document_id,
      1 - (dc.embedding <=> p_query_embedding) as similarity
    from public.document_chunks dc
    where dc.shop_id = p_shop_id
      and dc.embedding is not null
      and 1 - (dc.embedding <=> p_query_embedding) > p_match_threshold
    order by dc.embedding <=> p_query_embedding
    limit p_match_count;
end;
$$;
