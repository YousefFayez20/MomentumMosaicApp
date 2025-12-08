package org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage;

import lombok.*;

import java.util.List;
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSummary {
    private List<TaskItem> activeTasks;
    private List<TaskItem> completedTasks;

    private int totalDeepMinutes;
    private int totalShallowMinutes;
    private int totalFitnessMinutes;
}
