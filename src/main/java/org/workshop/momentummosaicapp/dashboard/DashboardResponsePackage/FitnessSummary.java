package org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage;

import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessSummary {
    private boolean didWorkoutToday;
    private int totalWorkoutDays;
    private int workoutStreak;

}
