// This simulates the current logged-in user's company
// In production, this would come from your auth session (Supabase, NextAuth, etc.)

export const CURRENT_COMPANY = {
  slug: 'demo-company',
  name: 'Demo Company',
  id: 'company-1',
};

// In production, this would be:
// export async function getCurrentCompany() {
//   const session = await getSession();
//   return await db.companies.findById(session.user.companyId);
// }
