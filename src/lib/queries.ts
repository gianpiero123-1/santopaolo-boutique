import type { SupabaseClient } from '@supabase/supabase-js';
import type { Booking, Note, Task } from './constants';

/** completed_at of the most recent successful sync, or null. */
export async function getLastSync(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase
    .from('sync_log')
    .select('completed_at')
    .eq('status', 'success')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.completed_at as string | undefined) ?? null;
}

/** Bookings overlapping [fromISO, toISO] (inclusive), excluding cancelled by default. */
export async function getBookingsInRange(
  supabase: SupabaseClient,
  fromISO: string,
  toISO: string,
  includeCancelled = false,
): Promise<Booking[]> {
  let q = supabase
    .from('bookings_cache')
    .select('*')
    .gte('checkout_date', fromISO)
    .lte('checkin_date', toISO)
    .order('checkin_date', { ascending: true });
  if (!includeCancelled) q = q.neq('status', 'cancelled');
  const { data } = await q;
  return (data as Booking[]) ?? [];
}

/** Bookings checking in on a given date. */
export async function getCheckins(supabase: SupabaseClient, iso: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings_cache')
    .select('*')
    .eq('checkin_date', iso)
    .neq('status', 'cancelled')
    .order('apartment_id', { ascending: true });
  return (data as Booking[]) ?? [];
}

/** Bookings checking out on a given date. */
export async function getCheckouts(supabase: SupabaseClient, iso: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings_cache')
    .select('*')
    .eq('checkout_date', iso)
    .neq('status', 'cancelled')
    .order('apartment_id', { ascending: true });
  return (data as Booking[]) ?? [];
}

/** Count of bookings occupied right now (checkin <= today < checkout). */
export async function getOccupiedNow(supabase: SupabaseClient, iso: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings_cache')
    .select('*')
    .lte('checkin_date', iso)
    .gt('checkout_date', iso)
    .neq('status', 'cancelled');
  return (data as Booking[]) ?? [];
}

/** Tasks within an inclusive due_at window. */
export async function getTasksBetween(
  supabase: SupabaseClient,
  fromISO: string,
  toISO: string,
  status?: 'pending' | 'completed',
): Promise<Task[]> {
  let q = supabase
    .from('tasks')
    .select('*')
    .gte('due_at', fromISO)
    .lte('due_at', toISO)
    .order('due_at', { ascending: true });
  if (status) q = q.eq('status', status);
  const { data } = await q;
  return (data as Task[]) ?? [];
}

export async function getBookingById(
  supabase: SupabaseClient,
  id: string,
): Promise<Booking | null> {
  const { data } = await supabase.from('bookings_cache').select('*').eq('id', id).maybeSingle();
  return (data as Booking | null) ?? null;
}

export async function getNotesForBooking(
  supabase: SupabaseClient,
  bookingId: string,
): Promise<Note[]> {
  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });
  return (data as Note[]) ?? [];
}

export async function getTasksForBooking(
  supabase: SupabaseClient,
  bookingId: string,
): Promise<Task[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('booking_id', bookingId)
    .order('due_at', { ascending: true });
  return (data as Task[]) ?? [];
}
