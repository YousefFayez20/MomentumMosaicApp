package org.workshop.momentummosaicapp.fitness.dto;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutRequest {

    @NotNull(message = "didWorkout is required")
    private Boolean didWorkout;
}
