type GuideMessageProps = {
  children: React.ReactNode;
};

export const GuideMessage = ({ children }: GuideMessageProps) => {
  return <p className="text-xs text-muted-foreground">{children}</p>;
};
