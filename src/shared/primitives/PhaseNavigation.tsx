type PhaseNavigationProps = {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideBack?: boolean;
  hideNext?: boolean;
};

const PhaseNavigation = ({
  onBack,
  onNext,
  backLabel = '이전',
  nextLabel = '다음',
  nextDisabled = false,
  hideBack = false,
  hideNext = false,
}: PhaseNavigationProps) => {
  return (
    <div className="flex justify-between">
      {!hideBack && onBack ? (
        <button onClick={onBack} className="text-sm hover:underline">
          {backLabel}
        </button>
      ) : (
        <div />
      )}
      {!hideNext && onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
};

export default PhaseNavigation;
