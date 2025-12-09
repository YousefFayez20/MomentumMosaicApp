package org.workshop.momentummosaicapp.fitness.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;



@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FitnessLogResponse {
    private boolean didWorkout;
    private LocalDate date;

}
