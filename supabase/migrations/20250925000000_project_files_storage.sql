/*
  Project-scoped Storage for shared files (links, PDFs, images, etc.)

  - Bucket: project-files (private)
  - Path convention: <project_id>/<filename>
  - Access:
      * manager: full access
      * client of that project: full access
      * employees assigned to that project: full access
*/

-- 1) Create bucket if missing
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

-- Helper: extract project_id (UUID) from object name '<project_id>/...'
-- We will parse it inline using split_part(name, '/', 1)::uuid

-- 2) RLS Policies
-- Enable RLS if not already enabled (it is by default on storage.objects)

-- Allow SELECT when user has access to the project
create policy if not exists "project-files-select"
on storage.objects for select
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.profiles pr
    where pr.id = auth.uid()
      and (
        pr.role = 'manager'
        or exists (
          select 1 from public.projects p
          where p.id = split_part(storage.objects.name, '/', 1)::uuid
            and (p.client_id = pr.id or pr.id = any(p.assigned_employees))
        )
      )
  )
);

-- Allow INSERT when user has access to the project
create policy if not exists "project-files-insert"
on storage.objects for insert
with check (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.profiles pr
    where pr.id = auth.uid()
      and (
        pr.role = 'manager'
        or exists (
          select 1 from public.projects p
          where p.id = split_part(storage.objects.name, '/', 1)::uuid
            and (p.client_id = pr.id or pr.id = any(p.assigned_employees))
        )
      )
  )
);

-- Allow UPDATE when user has access to the project
create policy if not exists "project-files-update"
on storage.objects for update
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.profiles pr
    where pr.id = auth.uid()
      and (
        pr.role = 'manager'
        or exists (
          select 1 from public.projects p
          where p.id = split_part(storage.objects.name, '/', 1)::uuid
            and (p.client_id = pr.id or pr.id = any(p.assigned_employees))
        )
      )
  )
);

-- Allow DELETE when user has access to the project
create policy if not exists "project-files-delete"
on storage.objects for delete
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.profiles pr
    where pr.id = auth.uid()
      and (
        pr.role = 'manager'
        or exists (
          select 1 from public.projects p
          where p.id = split_part(storage.objects.name, '/', 1)::uuid
            and (p.client_id = pr.id or pr.id = any(p.assigned_employees))
        )
      )
  )
);


