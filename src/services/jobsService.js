// Service for Job Info CRUD with Supabase
// Table: jobs (suggested columns below)
// id: uuid (PK), title: text, company: text, location: text, start_date: date, end_date: date|null,
// description: text, bullets: text[] (or JSON), created_at: timestamptz

import { supabase } from './supabaseClient';

// Fetch public job info for resume display
export async function getJobs({ limit = 20, order = { column: 'start_date', ascending: false } } = {}) {
  const query = supabase
    .from('jobs')
    .select('*')
    .order(order.column, { ascending: order.ascending, nullsFirst: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Fetch a single job by id
export async function getJobById(id) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Example: insert a new job (requires RLS policy permitting inserts for anon key or authenticated user)
export async function createJob(job) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Example: update a job
export async function updateJob(id, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Example: delete a job
export async function deleteJob(id) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
}
