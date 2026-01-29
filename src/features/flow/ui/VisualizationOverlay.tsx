type VisualizationOverlayProps = {
  countdown: number;
};

export const VisualizationOverlay = ({
  countdown,
}: VisualizationOverlayProps) => {
  return (
    <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg z-10">
      <div className="w-20 h-20 rounded-full border-4 border-primary bg-background flex items-center justify-center shadow-lg">
        <span className="text-3xl font-bold">{countdown}</span>
      </div>
    </div>
  );
};
