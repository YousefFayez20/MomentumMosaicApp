package org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage;

import lombok.*;
import org.workshop.momentummosaicapp.momentum.dto.MomentumSummary;


@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserSummary userSummary;
    private TaskSummary taskSummary;
    private FitnessSummary fitnessSummary;
    private MomentumSummary momentumSummary;
}
