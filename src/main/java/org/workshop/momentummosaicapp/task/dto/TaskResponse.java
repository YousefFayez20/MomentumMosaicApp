package org.workshop.momentummosaicapp.task.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.task.TaskStatus;
import org.workshop.momentummosaicapp.task.TaskType;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private TaskType taskType;
    private Integer durationMinutes;
    private boolean completed;
    private Instant completedAt;
    private TaskStatus status;
    private Instant startedAt;
    private Integer actualMinutes;
    private LocalDate plannedForDate;
    private Long workspaceId; // null if not linked
}
