-- ChronoStudy V11 - private Storage buckets and Vault reference handling

insert into storage.buckets (id, name, public)
values
  ('course-documents', 'course-documents', false),
  ('avatars', 'avatars', false)
on conflict (id) do update set public = false;

create policy "users_read_own_course_documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'course-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users_upload_own_course_documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users_update_own_course_documents"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'course-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users_delete_own_course_documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users_manage_own_avatars"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- The Vault extension must be enabled in the Supabase dashboard before this function is applied.
-- The secret value is never stored in public tables; only its Vault UUID is stored in user_integrations.
create or replace function public.set_openai_vault_secret(secret_value text)
returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  secret_id uuid;
  secret_name text := 'chronostudy-openai-' || auth.uid()::text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if secret_value is null or length(trim(secret_value)) < 20 then
    raise exception 'A valid API key is required';
  end if;

  select vault.create_secret(secret_value, secret_name, 'ChronoStudy OpenAI BYOK secret') into secret_id;

  insert into public.user_integrations (user_id, openai_vault_secret_ref, updated_at)
  values (auth.uid(), secret_id::text, now())
  on conflict (user_id) do update set openai_vault_secret_ref = excluded.openai_vault_secret_ref, updated_at = now();

  return secret_id;
end;
$$;

grant execute on function public.set_openai_vault_secret(text) to authenticated;
