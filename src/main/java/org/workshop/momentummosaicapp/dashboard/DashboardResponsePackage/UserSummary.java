package org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage;

import lombok.*;
import org.workshop.momentummosaicapp.user.Gender;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummary {
    private int heightCm;
    private int weightKg;
    private Gender gender;

    private double proteinMin;
    private double proteinMax;

    private int caloriesMaintenance;
    private int caloriesCut;
    private int caloriesBulk;
}
