/**
 * Working Hours Configuration
 *
 * Purpose: 근무 시간 및 미팅 슬롯 설정
 * Features:
 * - 근무 시간 정의
 * - 미팅 가능 시간 계산
 * - 공휴일 처리
 */

// ====================================================================
// Working Hours Configuration
// ====================================================================

export const WORKING_HOURS = {
  // 타임존
  timezone: 'Asia/Seoul',

  // 근무 요일 (월-금)
  days: ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const,

  // 근무 시간
  startHour: 9,   // 오전 9시
  endHour: 18,    // 오후 6시

  // 미팅 가능 시간 (오전 10시, 오후 2시, 오후 4시)
  meetingHours: [10, 14, 16] as const,

  // 미팅 슬롯 설정
  slotDuration: 60,  // 60분 슬롯
  advanceDays: 30,   // 30일 앞까지 슬롯 생성

  // 최소 예약 시간 (현재 시각으로부터 몇 시간 후부터 예약 가능)
  minBookingHours: 2,  // 최소 2시간 후부터 예약 가능
} as const;

// ====================================================================
// 공휴일 목록 (2025년 대한민국)
// ====================================================================

export const KOREAN_HOLIDAYS_2025 = [
  '2025-01-01', // 신정
  '2025-01-28', // 설날 연휴
  '2025-01-29', // 설날
  '2025-01-30', // 설날 연휴
  '2025-03-01', // 삼일절
  '2025-03-03', // 대체공휴일 (삼일절)
  '2025-05-05', // 어린이날
  '2025-05-06', // 대체공휴일 (어린이날)
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-09-06', // 추석 연휴
  '2025-09-07', // 추석 연휴
  '2025-09-08', // 추석
  '2025-09-09', // 추석 연휴
  '2025-10-03', // 개천절
  '2025-10-09', // 한글날
  '2025-12-25', // 크리스마스
];

// ====================================================================
// Utility Functions
// ====================================================================

/**
 * 특정 날짜가 공휴일인지 체크
 *
 * @param date - 체크할 날짜
 * @returns true if holiday
 */
export function isHoliday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return KOREAN_HOLIDAYS_2025.includes(dateString);
}

/**
 * 특정 날짜가 근무일인지 체크
 *
 * @param date - 체크할 날짜
 * @returns true if working day
 */
export function isWorkingDay(date: Date): boolean {
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];

  // 주말 체크
  if (!WORKING_HOURS.days.includes(dayOfWeek as any)) {
    return false;
  }

  // 공휴일 체크
  if (isHoliday(date)) {
    return false;
  }

  return true;
}

/**
 * 특정 시간이 미팅 가능 시간인지 체크
 *
 * @param date - 체크할 날짜/시간
 * @returns true if within meeting hours
 */
export function isWithinWorkingHours(date: Date): boolean {
  const hour = date.getHours();

  // 미팅 가능 시간 체크 (10시, 14시, 16시)
  return WORKING_HOURS.meetingHours.includes(hour);
}

/**
 * 특정 날짜의 모든 가능한 미팅 시간대 생성
 *
 * @param date - 날짜
 * @returns List of possible meeting time slots (10시, 14시, 16시)
 */
export function generateDailySlots(date: Date): Array<{ start: Date; end: Date }> {
  // 근무일이 아니면 빈 배열 반환
  if (!isWorkingDay(date)) {
    return [];
  }

  const slots: Array<{ start: Date; end: Date }> = [];

  // 미팅 가능 시간대만 슬롯 생성 (10시, 14시, 16시)
  for (const hour of WORKING_HOURS.meetingHours) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + WORKING_HOURS.slotDuration);

    slots.push({
      start: slotStart,
      end: slotEnd,
    });
  }

  return slots;
}

/**
 * 특정 기간의 모든 가능한 미팅 시간대 생성
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns List of all possible meeting time slots
 */
export function generateAllSlots(startDate: Date, endDate: Date): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    const dailySlots = generateDailySlots(currentDate);
    slots.push(...dailySlots);

    // 다음 날로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

/**
 * 최소 예약 시간 체크
 *
 * @param slotStart - 슬롯 시작 시간
 * @returns true if slot is bookable (meets minimum booking time)
 */
export function isBookable(slotStart: Date): boolean {
  const now = new Date();
  const minBookingTime = new Date(now);
  minBookingTime.setHours(minBookingTime.getHours() + WORKING_HOURS.minBookingHours);

  return slotStart >= minBookingTime;
}

/**
 * 현재 시각 기준 예약 가능한 슬롯 필터링
 *
 * @param slots - 모든 슬롯 목록
 * @returns Bookable slots only
 */
export function filterBookableSlots(slots: Array<{ start: Date; end: Date }>): Array<{ start: Date; end: Date }> {
  return slots.filter(slot => isBookable(slot.start));
}
