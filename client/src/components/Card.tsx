import React from 'react';
import { cn } from '../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hover = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-100 backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 pb-3', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100', className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('pt-1', className)} {...props} />
);
