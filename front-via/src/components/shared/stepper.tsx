
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  /** Etiqueta visible debajo del círculo. */
  label: string;
  /** Descripción opcional (un poco más pequeña, bajo el label). */
  description?: string;
}

interface StepperProps {
  /** Pasos en orden. */
  steps: Step[];
  /** Paso actual, 1-indexed (1 = primer paso). */
  currentStep: number;
  /** Callback al hacer click en un paso completado. Si no se provee, no son clickeables. */
  onStepClick?: (stepIndexZeroBased: number) => void;
  /** Variante: 'default' (horizontal con label debajo) | 'compact' (sin labels, solo dots). */
  variant?: 'default' | 'compact';
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'default',
  className,
}: StepperProps) {
  return (
    <ol
      className={cn(
        'flex items-start',
        variant === 'default' && 'gap-0',
        variant === 'compact' && 'gap-1',
        className,
      )}
      aria-label="Progreso del asistente"
    >
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isLast = idx === steps.length - 1;
        const clickable =
          onStepClick && (isCompleted || isCurrent);

        return (
          <li
            key={idx}
            className={cn(
              'relative flex flex-col items-center',
              variant === 'default' && !isLast && 'flex-1',
              variant === 'compact' && 'flex-1',
            )}
          >
            {/* Línea conectora a la derecha */}
            {!isLast && (
              <div
                aria-hidden="true"
                className={cn(
                  'absolute top-3.5 left-1/2 right-0 -mr-px h-px w-full',
                  isCompleted ? 'bg-brand' : 'bg-border',
                  variant === 'compact' && 'top-1',
                )}
              />
            )}

            {/* Círculo */}
            <button
              type="button"
              onClick={() => clickable && onStepClick?.(idx)}
              disabled={!clickable}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'relative z-10 flex items-center justify-center transition-all',
                variant === 'default' && 'h-7 w-7 rounded-full text-[11.5px] font-semibold',
                variant === 'compact' && 'h-2 w-full rounded-full',
                isCompleted &&
                  variant === 'default' &&
                  'bg-brand text-brand-foreground',
                isCompleted &&
                  variant === 'compact' &&
                  'bg-brand',
                isCurrent &&
                  variant === 'default' &&
                  'bg-brand text-brand-foreground ring-4 ring-brand/15',
                isCurrent &&
                  variant === 'compact' &&
                  'bg-brand',
                !isCompleted &&
                  !isCurrent &&
                  variant === 'default' &&
                  'border border-border bg-card text-muted-foreground',
                !isCompleted &&
                  !isCurrent &&
                  variant === 'compact' &&
                  'bg-muted',
                clickable && 'cursor-pointer hover:scale-105',
                !clickable && 'cursor-default',
              )}
            >
              {variant === 'default' && (
                isCompleted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span>{stepNum}</span>
                )
              )}
            </button>

            {/* Label */}
            {variant === 'default' && (
              <div className="mt-2 flex flex-col items-center px-2 text-center">
                <span
                  className={cn(
                    'text-[12px] font-medium leading-tight',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
