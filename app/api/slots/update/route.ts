import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Define the expected shape of a slot update
interface SlotUpdate {
  column_id: string;
  slot_number: number;
  status: 'available' | 'occupied' | 'booked';
  booking_time?: string | null; // Optional, as a string in ISO 8601 format
}

export async function PATCH(request: Request) {
  try {
    const updates: SlotUpdate[] = await request.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Invalid request body. Expected an array of slot updates.' }, { status: 400 });
    }

    // Use Promise.all to perform all updates concurrently
    const updatePromises = updates.map(update => {
      const { column_id, slot_number, status, booking_time } = update;
      
      const updateData: Partial<SlotUpdate> = { status };
      
      // Only include booking_time if the status is 'booked'
      if (status === 'booked' && booking_time) {
        updateData.booking_time = booking_time;
      } else {
        // Set booking_time to null for other statuses
        updateData.booking_time = null;
      }

      return supabase
        .from('parking_slots')
        .update(updateData)
        .eq('column_id', column_id)
        .eq('slot_number', slot_number);
    });

    const results = await Promise.all(updatePromises);

    // Check for errors in any of the updates
    const errors = results.map(res => res.error).filter(Boolean);
    if (errors.length > 0) {
      console.error('Supabase update errors:', errors);
      // We can decide how to handle partial failures here.
      // For now, we'll report the first error.
      return NextResponse.json({ error: errors[0]?.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Slots updated successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
