-- Seed preset_summaries: per-preset resume summary variants
-- Run AFTER presets have been created (seed_presets_links.sql)

insert into public.preset_summaries (id, preset_id, variant_index, points, paragraphs)
select gen_random_uuid(), p.id, 0,
  array[
    'Results-driven technologist with a strong foundation across systems, software, and cloud.',
    'Combines hands-on leadership with automation, security, and customer-focused delivery.',
    'Passionate about scalable design, developer experience, and measurable outcomes.'
  ],
  array[
    'Results-driven technologist spanning systems, software, and cloud; blends hands-on leadership with automation and security to deliver measurable outcomes.'
  ]
from public.presets p;

insert into public.preset_summaries (id, preset_id, variant_index, points, paragraphs)
select gen_random_uuid(), p.id, 1,
  array[
    concat('Tailored for ', p.name, ': emphasizes the most relevant achievements and tooling.'),
    'Highlights collaboration, mentorship, and pragmatic decision-making.',
    'Focused on shipping reliable solutions with clear business impact.'
  ],
  array[
    concat('Tailored for ', p.name, ', highlighting relevant achievements and tooling; collaborative and pragmatic, focused on shipping reliable solutions with clear business impact.')
  ]
from public.presets p;
