-- Cria automaticamente o perfil quando um usuário se cadastra no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."Profile" ("id", "userId", "fullName", "email", "createdAt", "updatedAt")
  values (
    replace(gen_random_uuid()::text, '-', ''),
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    now(),
    now()
  )
  on conflict ("userId") do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Mantém o e-mail do perfil sincronizado quando o usuário troca de e-mail.
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public."Profile"
     set "email" = new.email,
         "updatedAt" = now()
   where "userId" = new.id
     and coalesce("email", '') <> coalesce(new.email, '');
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
execute function public.handle_user_email_update();

-- RLS: cada usuário só acessa o próprio perfil via API pública (PostgREST).
-- O Prisma (role postgres) continua com acesso total, pois é dono das tabelas.
alter table public."Profile" enable row level security;

drop policy if exists "profile_select_own" on public."Profile";
create policy "profile_select_own"
  on public."Profile"
  for select
  to authenticated
  using (auth.uid() = "userId");

drop policy if exists "profile_update_own" on public."Profile";
create policy "profile_update_own"
  on public."Profile"
  for update
  to authenticated
  using (auth.uid() = "userId")
  with check (auth.uid() = "userId");
