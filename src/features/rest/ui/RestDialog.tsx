import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/core/dialog';
import { formatTimeShort } from '@/shared/lib/format';
import { useRestStore, type RestType } from '../model/store';
import { useTimerStore } from '@/features/timer';

type RestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewFlow: () => void;
  onEndDay: () => void;
  onRestStart?: () => void;
  onRestCancel?: () => void;
};

export const RestDialog = ({
  open,
  onOpenChange,
  onNewFlow,
  onEndDay,
  onRestStart,
  onRestCancel,
}: RestDialogProps) => {
  const isResting = useRestStore((s) => s.isResting);
  const restType = useRestStore((s) => s.restType);
  const startRest = useRestStore((s) => s.startRest);
  const endRest = useRestStore((s) => s.endRest);

  const remaining = useTimerStore((s) => s.remaining);
  const isRunning = useTimerStore((s) => s.isRunning);
  const tick = useTimerStore((s) => s.tick);

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

  // 다이얼로그 닫힐 때 상태 리셋
  useEffect(() => {
    if (!open) {
      endRest();
    }
  }, [open, endRest]);

  const handleRestStart = (type: RestType) => {
    onRestStart?.();
    startRest(type);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isResting && remaining > 0) {
      onRestCancel?.();
    }
    onOpenChange(newOpen);
  };

  const handleNewFlow = () => {
    onNewFlow();
    endRest();
  };

  const handleEndDay = () => {
    onEndDay();
    endRest();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {!isResting ? (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl">잠깐 쉬어가요</DialogTitle>
              <DialogDescription className="text-center space-y-2">
                <span className="block text-2xl pt-2">고생했어요!</span>
                <span className="block">
                  효율적 작업을 위해 반드시 10분은 쉬어가야 해요.
                  <br />
                  스트레칭을 한다면 추가 10분을 더 쉴 수 있어요!
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4 justify-center py-4">
              <button
                onClick={() => handleRestStart('short')}
                className="px-6 py-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium">10분</div>
              </button>
              <button
                onClick={() => handleRestStart('long')}
                className="px-6 py-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium">20분</div>
                <div className="text-xs text-muted-foreground">+ 스트레칭</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl">
                {isRestComplete ? '휴식 완료!' : '휴식 중...'}
              </DialogTitle>
            </DialogHeader>

            {/* 타이머 */}
            <div className="text-center py-4">
              <div
                className={`text-5xl font-bold ${isRestComplete ? 'text-green-500' : ''}`}
              >
                {formatTimeShort(remaining)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
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
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={handleNewFlow}
                disabled={!isRestComplete}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 Flow
              </button>
              <button
                onClick={handleEndDay}
                disabled={!isRestComplete}
                className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                오늘 마감
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
