package org.workshop.momentummosaicapp.task.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.task.TaskType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Title is Required")
    private String title;

    @NotNull(message = "Task type is required")
    private TaskType taskType;

    @Positive(message = "Duration must be positive")
    private Integer durationMinutes;
}
