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
      onValueChange={(v) => onValueChange(v as TaskType)}
      className="flex gap-2"
    >
      {Object.entries(TASK_OPTIONS).map(([key, { label, Icon, bgClass }]) => (
        <ToggleGroupItem
          key={key}
          value={key}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
            value === key ? `${bgClass} text-white` : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
          <span>{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
