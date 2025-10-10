import { supabase } from './supabaseClient';

// Fetch all presets (id, name)
export async function listPresets() {
  const { data, error } = await supabase
    .from('presets')
    .select('id, name, include_photo, summary_variant')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Fetch a single preset with jobs, variants, and skills
export async function getPreset(presetId) {
  // Fetch preset core
  const { data: preset, error: pErr } = await supabase
    .from('presets')
    .select('id, name, include_photo, summary_variant')
    .eq('id', presetId)
    .single();
  if (pErr) throw pErr;

  // Fetch jobs linked to this preset with ordering
  const { data: presetJobs, error: pjErr } = await supabase
    .from('preset_jobs')
    .select(`
      id, job_id, enabled, selected_variant, position,
      jobs(*, job_variants(job_id, variant_index, title, bullets))
    `)
    .eq('preset_id', presetId)
    .order('position', { ascending: true });
  if (pjErr) throw pjErr;

  // Build experiences list in the UI-friendly shape
  const experiences = (presetJobs || []).map((pj) => {
    // Collect variants for this job (now nested under jobs)
    const rawVariants = pj.jobs?.job_variants || [];
    const safeVariants = rawVariants.length
      ? rawVariants
      : [{
          variant_index: 0,
          title: pj.jobs?.title || 'Role',
          bullets: pj.jobs?.bullets || [],
        }];

    const variants = safeVariants
      .sort((a, b) => a.variant_index - b.variant_index)
      .map((v) => ({
        title: v.title,
        period: buildPeriod(pj.jobs?.start_date, pj.jobs?.end_date),
        bullets: v.bullets || [],
      }));

    return {
      id: pj.job_id,
      label: pj.jobs?.title || 'Role',
      enabled: pj.enabled,
      variants,
      selectedVariant: pj.selected_variant || 0,
    };
  });

  // Fetch skills groups + membership
  const { data: groups, error: gErr } = await supabase
    .from('skill_groups')
    .select('id, name, position, skills(id, label, position)')
    .order('position', { ascending: true });
  if (gErr) throw gErr;

  const { data: presetSkills, error: psErr } = await supabase
    .from('preset_skills')
    .select('preset_id, skill_id, enabled')
    .eq('preset_id', presetId);
  if (psErr) throw psErr;

  const skills = {};
  (groups || []).forEach((g) => {
    const items = (g.skills || []).sort((a, b) => a.position - b.position).map((s) => ({
      id: s.id,
      label: s.label,
      enabled: !!presetSkills?.find((ps) => ps.skill_id === s.id && ps.preset_id === presetId)?.enabled,
    }));
    skills[g.name] = items;
  });

  return {
    options: { includePhoto: !!preset.include_photo },
    summaryVariant: preset.summary_variant || 0,
    experiences,
    skills,
  };
}

function buildPeriod(start, end) {
  if (!start && !end) return '';
  const fmt = (d) => (d ? new Date(d).getFullYear() : 'Present');
  return `${fmt(start)} — ${fmt(end)}`;
}
