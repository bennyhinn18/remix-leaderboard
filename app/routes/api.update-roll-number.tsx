import { ActionFunctionArgs, json } from '@remix-run/node';
import { createServerSupabase } from '~/utils/supabase.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const roll_number = formData.get('roll_number') as string;
  const member_id = formData.get('member_id') as string;

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Validation
  if (!member_id) {
    return json({ success: false, error: 'Member ID is required' });
  }

  // If roll_number is empty, it means user is removing their roll number
  if (roll_number !== '') {
    // Validate roll number formats:
    // CS dept: 22RUCSA020 - Year(2) + RU + Dept(2) + Section(1) + Number(3)
    // AI dept: 23RUAI039 - Year(2) + RU + Dept(2) + Number(3)
    const csPatternWithSection = /^(22|23|24)RU[A-Z]{2}[A-Z]\d{3}$/;
    const aiPattern = /^(22|23|24)RUAI\d{3}$/;
    
    if (!csPatternWithSection.test(roll_number) && !aiPattern.test(roll_number)) {
      return json({
        success: false,
        error: 'Invalid roll number format. Expected formats: 22RUCSA020 or 23RUAI039',
      });
    }
    
    // Check if number part doesn't exceed 65
    const numberPart = parseInt(roll_number.substring(roll_number.length - 3));
    if (numberPart > 65) {
      return json({
        success: false,
        error: 'Roll number sequence should not exceed 065',
      });
    }

    // Check if the roll number is already associated with another account
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('roll_number', roll_number)
      .neq('id', member_id)
      .maybeSingle();

    if (existingMember) {
      return json({
        success: false,
        error: 'This roll number is already registered to another account',
      });
    }
  }

  // Update the member's roll number
  const { error } = await supabase
    .from('members')
    .update({ roll_number: roll_number || null })
    .eq('id', member_id);

  if (error) {
    console.error('Error updating roll number:', error);
    return json({
      success: false,
      error: 'Failed to update roll number. Please try again.',
    });
  }

  return json({
    success: true,
    message: roll_number
      ? 'Roll number updated successfully'
      : 'Roll number removed successfully',
  });
}
