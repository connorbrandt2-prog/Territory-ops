import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://clxbhlkbivfjcgsrfkhy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseGJobGtiaXZmamNnc3Jma2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTYwMTYsImV4cCI6MjA4ODUzMjAxNn0.ShMOPb4VDHMYjgK_ko14Z1lK2YzukOVyx63F6EywiLM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const PALETTE = ['#4a9eff', '#e0a020', '#7ecfff', '#e05060', '#a060e0', '#34a876', '#f07820', '#ccc']

/** Derives a display profile from a Supabase auth user object. */
export function getUserProfile(user) {
  if (!user) return null
  const meta = user.user_metadata || {}
  const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'User'
  const words = name.trim().split(/\s+/)
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  const colorIdx = (user.id.charCodeAt(0) + (user.id.charCodeAt(1) || 0)) % PALETTE.length
  return { id: user.id, name, initials, color: PALETTE[colorIdx], email: user.email }
}
