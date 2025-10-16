import { supabase } from './supabaseClient';

// List projects (optionally by preset)
export async function listProjects({ limit = 50, presetId = null } = {}) {
  if (presetId) {
    const { data, error } = await supabase
      .from('preset_projects')
      .select('position, projects(*, descriptions:description_id(paragraphs, bullets), project_skills(position, skills(name)))')
      .eq('preset_id', presetId)
      .eq('enabled', true)
      .order('position', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((row) => row.projects);
  }
  const { data, error } = await supabase
    .from('projects')
    .select('*, descriptions:description_id(paragraphs, bullets), project_skills(position, skills(name))')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
