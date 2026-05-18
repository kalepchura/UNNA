import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  texto?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export function LoadingSpinner({
  texto,
  size = 'md',
  fullPage = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  const content = (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground',
        sizeClass
      )} />
      {texto && <span className="text-sm">{texto}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {content}
      </div>
    );
  }

  return content;
}