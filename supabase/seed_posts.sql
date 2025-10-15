-- Optional Posts/tags seed for testing new schema

-- Ensure tag types exist (inserted by schema, but keep idempotent)
insert into public.tag_types (id, name)
values (gen_random_uuid(), 'value'), (gen_random_uuid(), 'vendor'), (gen_random_uuid(), 'technology'), (gen_random_uuid(), 'client')
on conflict (name) do nothing;

-- Create a sample description
with d as (
  insert into public.descriptions (id, paragraphs, bullets)
  values (gen_random_uuid(), array['Hello world post summary'], array['One bullet'])
  returning id
)
insert into public.posts (id, slug, title, summary_description_id, type, author, status, posted)
select gen_random_uuid(), 'hello-world', 'Hello World', d.id, 'blog', 'Josiah Ledua', 'draft', false from d
on conflict (slug) do nothing;
