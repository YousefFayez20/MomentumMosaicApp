package org.workshop.momentummosaicapp.fitness.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.FitnessSummary;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.UserSummary;

import java.time.LocalDate;



@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FitnessLogResponse {
    private boolean didWorkout;
    private LocalDate date;
    private UserSummary summary;

}
