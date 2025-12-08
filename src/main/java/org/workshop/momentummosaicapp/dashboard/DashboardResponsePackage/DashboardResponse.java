package org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage;

import lombok.*;


@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserSummary userSummary;
    private TaskSummary taskSummary;
    private FitnessSummary fitnessSummary;
}
