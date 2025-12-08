package org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage;

import lombok.*;
import org.workshop.momentummosaicapp.task.TaskType;

import java.time.Instant;
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskItem {
    private Long id;
    private String title;
    private TaskType taskType;
    private int durationMinutes;
    private boolean completed;
    private Instant completedAt;
}
