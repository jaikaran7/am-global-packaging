-- Enquiries table: matches contact form fields exactly
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text,
  product_category text not null,
  product text not null,
  quantity integer,
  ply_preference text,
  project_details text,
  status text not null default 'new', -- new, contacted, closed
  created_at timestamptz not null default now()
);

create index if not exists idx_enquiries_created_at on enquiries(created_at desc);
create index if not exists idx_enquiries_status on enquiries(status);

-- RLS: public can insert; only authenticated (admin) can read/update
alter table enquiries enable row level security;

drop policy if exists "Public can insert enquiries" on enquiries;
create policy "Public can insert enquiries"
  on enquiries for insert
  with check (true);

drop policy if exists "Admin can read enquiries" on enquiries;
create policy "Admin can read enquiries"
  on enquiries for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can update enquiries" on enquiries;
create policy "Admin can update enquiries"
  on enquiries for update
  using (auth.role() = 'authenticated');
