// ID 생성
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// 시간 포맷 (mm:ss)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 90분을 초로
export const FLOW_DURATION = 90 * 60;

// 휴식 시간
export const REST_DURATION = {
  short: 10 * 60,
  long: 20 * 60,
};
