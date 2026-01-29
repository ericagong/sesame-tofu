type SectionLabelProps = {
  children: React.ReactNode;
  size?: 'default' | 'small';
};

const SectionLabel = ({
  children,
  size = 'default',
}: SectionLabelProps) => {
  if (size === 'small') {
    return (
      <span className="text-[10px] text-muted-foreground/70">{children}</span>
    );
  }
  return <span className="text-xs text-muted-foreground">{children}</span>;
};

export default SectionLabel;
