type GuideMessageProps = {
  children: React.ReactNode;
};

const GuideMessage = ({ children }: GuideMessageProps) => {
  return <p className="text-xs text-muted-foreground">{children}</p>;
};

export default GuideMessage;
