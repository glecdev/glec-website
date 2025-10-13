/**
 * Automatic Meeting Slots Creation
 *
 * Purpose: Google Calendar와 연동하여 자동으로 미팅 슬롯 생성
 * Features:
 * - Google Calendar freebusy 체크
 * - 근무 시간 내 슬롯 자동 생성
 * - 이중 예약 방지
 * - Database 동기화
 */

import { sql } from '@vercel/postgres';
import {
  getFreeBusySlots,
  type FreeBusySlot,
} from './google-calendar';
import {
  WORKING_HOURS,
  generateAllSlots,
  filterBookableSlots,
} from './working-hours';

// ====================================================================
// Types
// ====================================================================

export interface CreatedSlot {
  id: string;
  start_time: Date;
  end_time: Date;
  is_available: boolean;
  google_event_id: string | null;
  sync_status: string;
}

export interface SlotCreationResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: number;
  slots: CreatedSlot[];
}

// ====================================================================
// Auto Create Meeting Slots
// ====================================================================

/**
 * Google Calendar freebusy를 체크하여 자동으로 미팅 슬롯 생성
 *
 * @returns Slot creation결과
 */
export async function autoCreateMeetingSlots(): Promise<SlotCreationResult> {
  console.log('🔄 Starting automatic meeting slots creation...');

  const result: SlotCreationResult = {
    success: true,
    created: 0,
    skipped: 0,
    errors: 0,
    slots: [],
  };

  try {
    // 1. 날짜 범위 설정
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + WORKING_HOURS.advanceDays);

    console.log(`📅 Date range: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    // 2. Google Calendar에서 busy 시간 가져오기
    console.log('🔍 Fetching Google Calendar freebusy...');
    const busySlots = await getFreeBusySlots(startDate, endDate);
    console.log(`📊 Found ${busySlots.length} busy slots in Google Calendar`);

    // 3. 근무 시간 내 모든 가능한 슬롯 생성
    console.log('⚙️  Generating possible time slots...');
    const possibleSlots = generateAllSlots(startDate, endDate);
    console.log(`📋 Generated ${possibleSlots.length} possible slots`);

    // 4. 예약 가능한 슬롯만 필터링 (최소 예약 시간 체크)
    const bookableSlots = filterBookableSlots(possibleSlots);
    console.log(`✅ ${bookableSlots.length} slots are bookable (meet minimum booking time)`);

    // 5. Busy 시간과 겹치지 않는 슬롯만 선택
    const availableSlots = bookableSlots.filter(slot => {
      const isBusy = busySlots.some(busy =>
        slot.start < busy.end && slot.end > busy.start
      );
      return !isBusy;
    });

    console.log(`🟢 ${availableSlots.length} slots are available (not busy)`);

    // 6. DB에 슬롯 저장 (중복 체크)
    for (const slot of availableSlots) {
      try {
        // 이미 존재하는 슬롯인지 체크
        const existing = await sql`
          SELECT id FROM meeting_slots
          WHERE start_time = ${slot.start.toISOString()}
          AND end_time = ${slot.end.toISOString()}
        `;

        if (existing.rows.length > 0) {
          result.skipped++;
          continue;
        }

        // 새 슬롯 생성
        const insertResult = await sql`
          INSERT INTO meeting_slots (
            id,
            start_time,
            end_time,
            is_available,
            sync_status,
            last_sync_at
          ) VALUES (
            ${crypto.randomUUID()},
            ${slot.start.toISOString()},
            ${slot.end.toISOString()},
            true,
            'SYNCED',
            NOW()
          )
          RETURNING *
        `;

        if (insertResult.rows.length > 0) {
          result.created++;
          result.slots.push(insertResult.rows[0] as CreatedSlot);
        }
      } catch (error) {
        console.error(`Error creating slot ${slot.start.toISOString()}:`, error);
        result.errors++;
      }
    }

    console.log(`\n✅ Slot creation completed:`);
    console.log(`   Created: ${result.created}`);
    console.log(`   Skipped (duplicates): ${result.skipped}`);
    console.log(`   Errors: ${result.errors}`);

    return result;
  } catch (error) {
    console.error('❌ Auto create meeting slots failed:', error);
    result.success = false;
    return result;
  }
}

// ====================================================================
// Sync Existing Slots with Google Calendar
// ====================================================================

/**
 * 기존 DB 슬롯들을 Google Calendar와 동기화
 *
 * @returns Sync 결과
 */
export async function syncSlotsWithGoogleCalendar(): Promise<{
  success: boolean;
  synced: number;
  errors: number;
}> {
  console.log('🔄 Syncing existing slots with Google Calendar...');

  const result = {
    success: true,
    synced: 0,
    errors: 0,
  };

  try {
    // 1. 미래의 모든 슬롯 가져오기
    const slots = await sql`
      SELECT * FROM meeting_slots
      WHERE start_time > NOW()
      AND is_available = true
      ORDER BY start_time ASC
    `;

    if (slots.rows.length === 0) {
      console.log('ℹ️  No future slots to sync');
      return result;
    }

    console.log(`📊 Found ${slots.rows.length} future slots to sync`);

    // 2. Google Calendar freebusy 가져오기
    const startDate = new Date();
    const endDate = new Date(slots.rows[slots.rows.length - 1].start_time);

    const busySlots = await getFreeBusySlots(startDate, endDate);
    console.log(`📊 Found ${busySlots.length} busy slots in Google Calendar`);

    // 3. 각 슬롯을 Google Calendar와 비교
    for (const slot of slots.rows) {
      try {
        const slotStart = new Date(slot.start_time);
        const slotEnd = new Date(slot.end_time);

        // Busy 시간과 겹치는지 체크
        const isBusy = busySlots.some((busy: FreeBusySlot) =>
          slotStart < busy.end && slotEnd > busy.start
        );

        // Busy라면 슬롯을 사용 불가로 업데이트
        if (isBusy) {
          await sql`
            UPDATE meeting_slots
            SET is_available = false,
                sync_status = 'BUSY',
                last_sync_at = NOW()
            WHERE id = ${slot.id}
          `;

          result.synced++;
          console.log(`   Slot ${slot.id} marked as busy`);
        } else {
          // Available하다면 sync_status만 업데이트
          await sql`
            UPDATE meeting_slots
            SET sync_status = 'SYNCED',
                last_sync_at = NOW()
            WHERE id = ${slot.id}
          `;

          result.synced++;
        }
      } catch (error) {
        console.error(`Error syncing slot ${slot.id}:`, error);
        result.errors++;
      }
    }

    console.log(`\n✅ Sync completed:`);
    console.log(`   Synced: ${result.synced}`);
    console.log(`   Errors: ${result.errors}`);

    return result;
  } catch (error) {
    console.error('❌ Sync with Google Calendar failed:', error);
    result.success = false;
    return result;
  }
}

// ====================================================================
// Cleanup Old Slots
// ====================================================================

/**
 * 과거 슬롯 정리 (7일 이상 지난 슬롯 삭제)
 *
 * @returns Cleanup 결과
 */
export async function cleanupOldSlots(): Promise<{
  success: boolean;
  deleted: number;
}> {
  console.log('🧹 Cleaning up old meeting slots...');

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await sql`
      DELETE FROM meeting_slots
      WHERE end_time < ${sevenDaysAgo.toISOString()}
      AND id NOT IN (
        SELECT meeting_slot_id FROM meeting_bookings
        WHERE booking_status != 'CANCELLED'
      )
    `;

    console.log(`✅ Deleted ${result.rowCount} old slots`);

    return {
      success: true,
      deleted: result.rowCount || 0,
    };
  } catch (error) {
    console.error('❌ Cleanup old slots failed:', error);
    return {
      success: false,
      deleted: 0,
    };
  }
}

// ====================================================================
// Full Sync Process
// ====================================================================

/**
 * 전체 동기화 프로세스 (생성 + 동기화 + 정리)
 *
 * @returns Full sync 결과
 */
export async function fullSyncProcess(): Promise<{
  success: boolean;
  created: number;
  synced: number;
  deleted: number;
  errors: number;
}> {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 FULL SYNC PROCESS - Google Calendar ↔ Database');
  console.log('='.repeat(70));

  const startTime = Date.now();

  // 1. 자동 슬롯 생성
  const createResult = await autoCreateMeetingSlots();

  // 2. 기존 슬롯 동기화
  const syncResult = await syncSlotsWithGoogleCalendar();

  // 3. 오래된 슬롯 정리
  const cleanupResult = await cleanupOldSlots();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('📊 FULL SYNC SUMMARY');
  console.log('='.repeat(70));
  console.log(`   Created: ${createResult.created}`);
  console.log(`   Synced: ${syncResult.synced}`);
  console.log(`   Deleted: ${cleanupResult.deleted}`);
  console.log(`   Errors: ${createResult.errors + syncResult.errors}`);
  console.log(`   Duration: ${duration}s`);
  console.log('='.repeat(70));

  return {
    success: createResult.success && syncResult.success && cleanupResult.success,
    created: createResult.created,
    synced: syncResult.synced,
    deleted: cleanupResult.deleted,
    errors: createResult.errors + syncResult.errors,
  };
}
