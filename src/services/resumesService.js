import { supabase, getPublicStorageUrl } from './supabaseClient';

// List available resumes (id, title)
export async function listResumes() {
  const { data, error } = await supabase
    .from('resumes')
    .select('id, title')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Fetch a single resume and map to UI shape consumed by ResumePage
export async function getResume(resumeId) {
  // Resume core
  const { data: resume, error: rErr } = await supabase
    .from('resumes')
    .select('id, title, profile_photo_id, summary_description_id')
    .eq('id', resumeId)
    .single();
  if (rErr) throw rErr;

  // Summary description
  let summary = { bullets: [], paragraphs: [] };
  if (resume.summary_description_id) {
    const { data: desc, error: dErr } = await supabase
      .from('descriptions')
      .select('bullets, paragraphs')
      .eq('id', resume.summary_description_id)
      .single();
    if (dErr) throw dErr;
    summary = { bullets: desc?.bullets || [], paragraphs: desc?.paragraphs || [] };
  }

  // Resume jobs (ordered)
  const { data: resumeJobs, error: jErr } = await supabase
    .from('resume_jobs')
    .select(`
      job_id,
      position,
      jobs(
        id,
        company,
        role,
        type,
        start_date,
        end_date,
        location:location_id(country, region, city),
        job_icon_light:job_icon_light_id(file_path, alt),
        job_icon_dark:job_icon_dark_id(file_path, alt)
      )
    `)
    .eq('resume_id', resumeId)
    .order('position', { ascending: true });
  if (jErr) throw jErr;

  // For each job, fetch first description (if any)
  const jobIds = (resumeJobs || []).map((rj) => rj.job_id);
  let byJobDescription = new Map();
  let byJobSkills = new Map();
  if (jobIds.length) {
    const { data: jobDescs, error: jdErr } = await supabase
      .from('job_descriptions')
      .select('job_id, position, description:descriptions(id, paragraphs, bullets)')
      .in('job_id', jobIds)
      .order('position', { ascending: true });
    if (jdErr) throw jdErr;
    // Pick the first description per job
    for (const row of jobDescs || []) {
      if (!byJobDescription.has(row.job_id)) {
        byJobDescription.set(row.job_id, row.description);
      }
    }

    // Fetch job skills for these jobs
    const { data: jobSkills, error: jsErr } = await supabase
      .from('job_skills')
      .select('job_id, skills(id, name)')
      .in('job_id', jobIds);
    if (jsErr) throw jsErr;
    for (const row of jobSkills || []) {
      const k = row.job_id;
      const name = row.skills?.name;
      if (!name) continue;
      if (!byJobSkills.has(k)) byJobSkills.set(k, []);
      // avoid duplicates
      const arr = byJobSkills.get(k);
      if (!arr.includes(name)) arr.push(name);
    }
  }

  const experiences = (resumeJobs || []).map((rj) => {
    const j = rj.jobs || {};
    const d = byJobDescription.get(rj.job_id) || { paragraphs: [], bullets: [] };
    const lightPath = j?.job_icon_light?.file_path || null;
    const darkPath = j?.job_icon_dark?.file_path || null;
    const iconLight = lightPath ? getPublicStorageUrl(lightPath) : null;
    const iconDark = darkPath ? getPublicStorageUrl(darkPath) : null;
    const loc = j?.location || null;
    const locationText = buildLocation(loc?.city, loc?.region, loc?.country);
    const variant = {
      title: `${j.company || 'Company'} · ${j.role || 'Role'}`,
      period: buildPeriod(j.start_date, j.end_date),
      employmentType: j.type || null,
      location: locationText,
      summary: d.paragraphs?.[0] || null,
      bullets: d.bullets || [],
      skills: byJobSkills.get(rj.job_id) || [],
    };
    return {
      id: rj.job_id,
      label: `${j.company || 'Company'} · ${j.role || 'Role'}`,
      enabled: true,
      iconLight,
      iconDark,
      variants: [variant],
      selectedVariant: 0,
    };
  });

  // Load all skills and mark initial visibility based on resume_skills
  const { data: resumeSkills, error: rsErr } = await supabase
    .from('resume_skills')
    .select('skill_id')
    .eq('resume_id', resumeId);
  if (rsErr) throw rsErr;
  const enabledSet = new Set((resumeSkills || []).map((r) => r.skill_id));

  const { data: allSkills, error: allErr } = await supabase
    .from('skills')
    .select('id, name, skill_group_skills(position, skill_groups(id, name))')
    .order('name', { ascending: true });
  if (allErr) throw allErr;

  const skills = {};
  (allSkills || []).forEach((skill) => {
    // Choose the first group (if multiple) or fallback to 'Other'
    const group = skill.skill_group_skills?.[0]?.skill_groups?.name || 'Other';
    if (!skills[group]) skills[group] = [];
    skills[group].push({ id: skill.id, label: skill.name, enabled: enabledSet.has(skill.id) });
  });

  // Education: show all, newest first
  const { data: edu, error: eErr } = await supabase
    .from('education')
    .select('id, school, degree, major, start_date, end_date')
    .order('start_date', { ascending: false });
  if (eErr) throw eErr;
  // Fetch related skills for these education items (ordered)
  const eduIds = (edu || []).map((e) => e.id);
  const byEduSkills = new Map();
  if (eduIds.length) {
    const { data: eduSkills, error: esErr } = await supabase
      .from('education_skills')
      .select('education_id, position, skills(id, name)')
      .in('education_id', eduIds)
      .order('position', { ascending: true });
    if (esErr) throw esErr;
    for (const row of eduSkills || []) {
      const k = row.education_id;
      const name = row.skills?.name;
      if (!name) continue;
      if (!byEduSkills.has(k)) byEduSkills.set(k, []);
      const arr = byEduSkills.get(k);
      if (!arr.includes(name)) arr.push(name);
    }
  }

  const education = (edu || []).map((e) => ({
    id: e.id,
    label: e.school,
    enabled: true,
    degree: e.degree,
    field: e.major,
    period: buildPeriod(e.start_date, e.end_date),
    summary: null,
    bullets: [],
    skills: byEduSkills.get(e.id) || [],
  }));

  // Certificates: show all, newest first
  const { data: certs, error: cErr } = await supabase
    .from('certificates')
    .select('id, name, issuer, issue_date, expiry_date, credential_id, credential_url')
    .order('issue_date', { ascending: false });
  if (cErr) throw cErr;
  const certificates = (certs || []).map((c) => ({
    id: c.id,
    label: c.name,
    enabled: true,
    issuer: c.issuer,
    period: buildPeriod(c.issue_date, c.expiry_date),
    credentialId: c.credential_id,
    credentialUrl: c.credential_url,
    summary: null,
  }));

  // Contact accounts for this resume (ordered)
  let accounts = [];
  // Load visibility map for this resume (default visible=true if no row)
  let visibilityByAccount = new Map();
  try {
    const { data: visRows } = await supabase
      .from('resume_account_visibility')
      .select('account_id, visible')
      .eq('resume_id', resumeId);
    for (const v of visRows || []) {
      visibilityByAccount.set(v.account_id, !!v.visible);
    }
  } catch (_) {
    // ignore visibility fetch errors; default to visible
  }
  try {
    const { data: rAccounts, error: raErr } = await supabase
      .from('resume_accounts')
      .select('account_id, position, label, accounts:accounts(*)')
      .eq('resume_id', resumeId)
      .order('position', { ascending: true });
    if (raErr) throw raErr;
    accounts = (rAccounts || [])
      .map((row) => {
        const accountId = row.accounts?.id || row.account_id;
        const isVisible = visibilityByAccount.has(accountId)
          ? !!visibilityByAccount.get(accountId)
          : true;
        if (!isVisible) return null; // hidden via visibility rules
        // If the related account row is hidden by RLS, row.accounts will be null.
        // Preserve a placeholder so the UI can show an anonymized/gated contact entry.
        if (row.accounts) {
          return {
            id: row.accounts.id,
            name: row.accounts.name || '',
            url: row.accounts.link || '',
            icon: row.accounts.icon || null,
            label: row.label || null,
            position: row.position ?? 0,
            requiresAuth: !!row.accounts.requires_auth,
          };
        }
        // Placeholder for RLS-hidden account, still respect visibility
        return {
          id: row.account_id, // fallback to the FK to keep ordering and dedupe
          name: row.label || 'Private contact',
          url: '', // not accessible due to RLS
          icon: null,
          label: row.label || null,
          position: row.position ?? 0,
          requiresAuth: true,
        };
      })
      // Keep any row that has an id so placeholders remain visible in UI
      .filter((a) => a && a.id);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load resume_accounts, will try fallback accounts:', e?.message || e);
  }

  // Fallback: If no resume-linked accounts, show all public accounts (and private ones will still be gated in UI)
  if (!accounts || accounts.length === 0) {
    const { data: accs, error: accErr } = await supabase
      .from('accounts')
      .select('id, name, icon, link, requires_auth')
      .order('name', { ascending: true });
    if (!accErr) {
      accounts = (accs || [])
        .filter((a) => {
          const isVisible = visibilityByAccount.has(a.id)
            ? !!visibilityByAccount.get(a.id)
            : true;
          return isVisible;
        })
        .map((a, idx) => ({
          id: a.id,
          name: a.name || '',
          url: a.link || '',
          icon: a.icon || null,
          label: null,
          position: idx,
          requiresAuth: !!a.requires_auth,
        }))
        .filter((a) => a.id && a.url);
    }
  }

  return {
    options: { includePhoto: !!resume.profile_photo_id },
    summaryVariant: 0,
    summaryVariants: [{ bulletLines: summary.bullets || [], pointLines: summary.bullets || [], paragraphs: summary.paragraphs || [] }],
    experiences,
    skills,
    education,
    certificates,
    accounts,
  };
}

function buildPeriod(start, end) {
  if (!start && !end) return '';
  const fmt = (d) => (d ? new Date(d).getFullYear() : 'Present');
  return `${fmt(start)} — ${fmt(end)}`;
}

function buildLocation(city, region, country) {
  const parts = [];
  if (city) parts.push(city);
  if (region) parts.push(region);
  if (country) parts.push(country);
  return parts.join(', ');
}
