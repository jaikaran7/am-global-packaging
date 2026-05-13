import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

/** Session is validated in middleware; do not call `getUser()` again here (avoids double refresh token use). */
export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count }, { data: recentEnquiries }] = await Promise.all([
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('enquiries').select('id, full_name, product_category, product, status, created_at').order('created_at', { ascending: false }).limit(3),
  ])

  const recent = (recentEnquiries ?? []).map((e) => ({
    id: e.id,
    name: e.full_name,
    subject: `${e.product_category} — ${e.product}`,
    status: (e.status === 'new' ? 'new' : 'read') as 'new' | 'read',
  }))

  return <DashboardClient newEnquiriesCount={count ?? 0} recentEnquiries={recent} />
}
