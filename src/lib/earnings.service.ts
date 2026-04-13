import { supabaseAdmin } from '@/lib/supabase/admin';

interface EarningInput {
  userId: string;
  amount: number;
}

export async function processProjectEarnings(projectId: string, earnings: EarningInput[]) {
  const earningRecords = earnings.map((e) => ({
    project_id: projectId,
    user_id: e.userId,
    gross_amount: e.amount,
    take_home: Math.round(e.amount * 50) / 100,
    savings: Math.round(e.amount * 50) / 100,
  }));

  const { data: insertedEarnings, error: earningsError } = await supabaseAdmin
    .from('earnings')
    .insert(earningRecords)
    .select();

  if (earningsError) {
    throw new Error(`Failed to insert earnings: ${earningsError.message}`);
  }

  const savingsRecords = earnings.map((e) => ({
    user_id: e.userId,
    project_id: projectId,
    amount: Math.round(e.amount * 50) / 100,
    description: `50% savings from project earnings`,
    type: 'deposit' as const,
  }));

  const { error: savingsError } = await supabaseAdmin
    .from('savings_fund')
    .insert(savingsRecords);

  if (savingsError) {
    throw new Error(`Failed to insert savings: ${savingsError.message}`);
  }

  // Update project total_revenue
  const totalRevenue = earnings.reduce((sum, e) => sum + e.amount, 0);
  const { error: projectError } = await supabaseAdmin
    .from('projects')
    .update({
      total_revenue: totalRevenue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (projectError) {
    throw new Error(`Failed to update project revenue: ${projectError.message}`);
  }

  return insertedEarnings;
}
