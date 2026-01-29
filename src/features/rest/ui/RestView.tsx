import { useEffect } from 'react';
import { useRestStore, type RestType } from '../model/store';
import { useFlowStore } from '@/features/flow';
import { useTimerStore } from '@/features/timer';
import { formatTimeShort } from '@/shared/lib/format';

export const RestView = () => {
  const isResting = useRestStore((s) => s.isResting);
  const restType = useRestStore((s) => s.restType);
  const startRest = useRestStore((s) => s.startRest);
  const endRest = useRestStore((s) => s.endRest);

  const remaining = useTimerStore((s) => s.remaining);
  const isRunning = useTimerStore((s) => s.isRunning);
  const tick = useTimerStore((s) => s.tick);
  const start = useTimerStore((s) => s.start);

  const resetFlow = useFlowStore((s) => s.resetFlow);

  const isRestComplete = isResting && remaining <= 0;
  const restDuration = restType === 'long' ? 20 : 10;

  // 휴식 타이머
  useEffect(() => {
    if (!isResting || !isRunning || remaining <= 0) return;

    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, isRunning, remaining, tick]);

  const handleRestStart = (type: RestType) => {
    startRest(type);
  };

  const handleNewFlow = () => {
    start('flow');
    resetFlow();
    endRest();
  };

  const handleEndDay = () => {
    start('flow');
    endRest();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full p-8 space-y-8">
        {!isResting ? (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">잠깐 쉬어가요</h1>
              <p className="text-4xl">고생했어요!</p>
              <p className="text-muted-foreground">
                효율적 작업을 위해 반드시 10분은 쉬어가야 해요.
                <br />
                스트레칭을 한다면 추가 10분을 더 쉴 수 있어요!
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleRestStart('short')}
                className="px-8 py-6 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-xl font-medium">10분</div>
              </button>
              <button
                onClick={() => handleRestStart('long')}
                className="px-8 py-6 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-xl font-medium">20분</div>
                <div className="text-sm text-muted-foreground">+ 스트레칭</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {isRestComplete ? '휴식 완료!' : '휴식 중...'}
              </h1>
            </div>

            {/* 타이머 */}
            <div className="text-center py-8">
              <div
                className={`text-6xl font-bold font-mono ${isRestComplete ? 'text-green-500' : ''}`}
              >
                {formatTimeShort(remaining)}
              </div>
              <p className="text-muted-foreground mt-4">
                {restDuration}분 휴식 {isRestComplete ? '완료' : '중'}
              </p>
            </div>

            {/* YouTube 영상 */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={
                  restType === 'long'
                    ? 'https://www.youtube.com/embed/7jTO4GqHbog?autoplay=1'
                    : 'https://www.youtube.com/embed/AT7hIY1vNy0?autoplay=1'
                }
                title="휴식 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* 완료 후 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleNewFlow}
                disabled={!isRestComplete}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 Flow
              </button>
              <button
                onClick={handleEndDay}
                disabled={!isRestComplete}
                className="px-8 py-3 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                오늘 마감
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
