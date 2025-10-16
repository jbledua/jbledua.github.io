import { supabase } from './supabaseClient';

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
    .select('job_id, position, jobs(id, company, role, type, start_date, end_date)')
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
    const variant = {
      title: `${j.role || 'Role'} · ${j.company || 'Company'}`,
      period: buildPeriod(j.start_date, j.end_date),
      employmentType: j.type || null,
      summary: d.paragraphs?.[0] || null,
      bullets: d.bullets || [],
      skills: byJobSkills.get(rj.job_id) || [],
    };
    return {
      id: rj.job_id,
      label: `${j.role || 'Role'} · ${j.company || 'Company'}`,
      enabled: true,
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
  const education = (edu || []).map((e) => ({
    id: e.id,
    label: e.school,
    enabled: true,
    degree: e.degree,
    field: e.major,
    period: buildPeriod(e.start_date, e.end_date),
    summary: null,
    bullets: [],
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
  const { data: rAccounts, error: raErr } = await supabase
    .from('resume_accounts')
    .select('position, label, accounts:accounts(id, name, icon, link)')
    .eq('resume_id', resumeId)
    .order('position', { ascending: true });
  if (raErr) throw raErr;
  const accounts = (rAccounts || [])
    .map((row) => ({
      id: row.accounts?.id,
      name: row.accounts?.name || '',
      url: row.accounts?.link || '',
      icon: row.accounts?.icon || null,
      label: row.label || null,
      position: row.position ?? 0,
    }))
    .filter((a) => a.id && a.url);

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
