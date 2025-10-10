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
      jobs(*, job_variants(job_id, variant_index, title, summary, bullets))
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
          summary: pj.jobs?.description || null,
          bullets: pj.jobs?.bullets || [],
        }];

    const variants = safeVariants
      .sort((a, b) => a.variant_index - b.variant_index)
      .map((v) => ({
        title: v.title,
        period: buildPeriod(pj.jobs?.start_date, pj.jobs?.end_date),
        employmentType: pj.jobs?.employment_type || null,
        summary: v.summary || null,
        bullets: v.bullets || [],
      }));

    return {
      id: pj.job_id,
      label: pj.jobs?.role || pj.jobs?.title || 'Role',
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

  // Fetch education linked to this preset with ordering
  const { data: presetEducation, error: peErr } = await supabase
    .from('preset_education')
    .select(`
      id, education_id, enabled, position,
      education(*)
    `)
    .eq('preset_id', presetId)
    .order('position', { ascending: true });
  if (peErr) throw peErr;

  const education = (presetEducation || []).map((pe) => ({
    id: pe.education_id,
    label: pe.education?.school || 'School',
    enabled: pe.enabled,
    degree: pe.education?.degree || null,
    field: pe.education?.field_of_study || null,
    location: pe.education?.location || null,
    period: buildPeriod(pe.education?.start_date, pe.education?.end_date),
    summary: pe.education?.description || null,
    bullets: pe.education?.bullets || [],
  }));

  // Fetch certificates linked to this preset with ordering
  const { data: presetCertificates, error: pcErr } = await supabase
    .from('preset_certificates')
    .select(`
      id, certificate_id, enabled, position,
      certificates(*)
    `)
    .eq('preset_id', presetId)
    .order('position', { ascending: true });
  if (pcErr) throw pcErr;

  const certificates = (presetCertificates || []).map((pc) => ({
    id: pc.certificate_id,
    label: pc.certificates?.name || 'Certificate',
    enabled: pc.enabled,
    issuer: pc.certificates?.issuer || null,
    period: buildPeriod(pc.certificates?.issue_date, pc.certificates?.expiration_date),
    credentialId: pc.certificates?.credential_id || null,
    credentialUrl: pc.certificates?.credential_url || null,
    summary: pc.certificates?.description || null,
    tags: pc.certificates?.tags || [],
  }));

  return {
    options: { includePhoto: !!preset.include_photo },
    summaryVariant: preset.summary_variant || 0,
    experiences,
    skills,
    education,
    certificates,
  };
}

function buildPeriod(start, end) {
  if (!start && !end) return '';
  const fmt = (d) => (d ? new Date(d).getFullYear() : 'Present');
  return `${fmt(start)} — ${fmt(end)}`;
}
