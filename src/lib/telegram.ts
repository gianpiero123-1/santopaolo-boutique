import { env } from './env';
import { createServerSupabase } from './supabase-client';

export interface TelegramResult {
  success: boolean;
  response: unknown;
}

/**
 * Send a Telegram message to the configured chat and record it in telegram_log.
 * Messages are plain text (no emoji, no markdown) per the Cockpit conventions.
 *
 * @param text         message body
 * @param messageType  audit category, e.g. 'morning_brief', 'new_booking'
 * @param referenceId  optional uuid linking the message to a booking/task
 */
export async function sendTelegramMessage(
  text: string,
  messageType: string,
  referenceId?: string,
): Promise<TelegramResult> {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chatId = env('TELEGRAM_CHAT_ID');

  let success = false;
  let response: unknown = null;

  try {
    if (!token || !chatId) {
      throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    response = await res.json().catch(() => null);
    success = res.ok && (response as { ok?: boolean } | null)?.ok === true;
  } catch (err) {
    response = { error: err instanceof Error ? err.message : String(err) };
    success = false;
  }

  // Audit log — never let a logging failure mask the send result.
  try {
    const supabase = createServerSupabase();
    await supabase.from('telegram_log').insert({
      message_type: messageType,
      reference_id: referenceId ?? null,
      content: text,
      success,
      telegram_response: response,
    });
  } catch {
    // swallow logging errors
  }

  return { success, response };
}

/**
 * Whether a message of `messageType` for `referenceId` was already sent
 * successfully. Used to de-duplicate check-in reminders.
 */
export async function alreadySent(
  messageType: string,
  referenceId: string,
): Promise<boolean> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('telegram_log')
    .select('id')
    .eq('message_type', messageType)
    .eq('reference_id', referenceId)
    .eq('success', true)
    .limit(1);
  return Array.isArray(data) && data.length > 0;
}
