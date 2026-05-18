import * as React from 'react';
import { Brain, Zap, Dumbbell } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export type TaskType = 'DEEP' | 'SHALLOW' | 'FITNESS';

interface TaskTypeSelectorProps {
  value: TaskType;
  onValueChange: (value: TaskType) => void;
}

// Map of task types to visual metadata
const TASK_OPTIONS: Record<TaskType, { label: string; Icon: typeof Brain; bgClass: string }> = {
  DEEP: { label: 'Deep Work', Icon: Brain, bgClass: 'bg-indigo-600' },
  SHALLOW: { label: 'Shallow Work', Icon: Zap, bgClass: 'bg-sky-600' },
  FITNESS: { label: 'Fitness', Icon: Dumbbell, bgClass: 'bg-emerald-600' },
};

export function TaskTypeSelector({ value, onValueChange }: TaskTypeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v as TaskType);
      }}
      className="flex w-full p-1 bg-muted/60 border border-white/50 dark:border-white/5 dark:bg-muted/30 rounded-xl gap-1"
    >
      {Object.entries(TASK_OPTIONS).map(([key, { label, Icon, bgClass }]) => (
        <ToggleGroupItem
          key={key}
          value={key}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer',
            value === key ? `${bgClass} text-white shadow-sm font-bold` : 'text-muted-foreground hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5',
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          <span>{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
