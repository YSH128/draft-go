import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

// dayjs 플러그인 및 한국어 로케일 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

/**
 * 상대 시간 포맷팅
 * @param {string|Date} dateString - ISO 8601 형식의 날짜 문자열 또는 Date 객체
 * @returns {string} "방금 전", "5분 전", "2시간 전", "3일 전" 등
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '알 수 없음';

  const date = dayjs(dateString);

  if (!date.isValid()) return '알 수 없음';

  return date.fromNow();
};

/**
 * 남은 시간 포맷팅 (카운트다운용)
 * @param {string|Date} targetDate - 목표 시간
 * @returns {string} "HH:MM:SS 남음" 또는 "시작됨"
 */
export const formatTimeRemaining = (targetDate) => {
  if (!targetDate) return '';

  const target = dayjs(targetDate);
  const now = dayjs();

  if (!target.isValid()) return '';

  const diff = target.diff(now);

  if (diff <= 0) return '시작됨';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }
  if (minutes > 0) {
    return `${minutes}분 ${seconds}초 남음`;
  }
  return `${seconds}초 남음`;
};

/**
 * 날짜를 "YYYY.MM.DD HH:mm" 형식으로 포맷팅
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';

  const date = dayjs(dateString);

  if (!date.isValid()) return '';

  return date.format('YYYY.MM.DD HH:mm');
};
