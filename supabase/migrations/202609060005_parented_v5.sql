-- ParentEd V5: weighted grades and calendar import tracking.
alter table public.grades add column weight numeric not null default 1 check (weight > 0 and weight <= 100);
-- Imported calendar events keep their source identifier so a second import updates instead of duplicating.
alter table public.tasks add column source text not null default '' check (length(source) <= 300);
create index tasks_source_idx on public.tasks(family_id, source) where source <> '';
