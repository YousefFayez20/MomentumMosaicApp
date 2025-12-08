package org.workshop.momentummosaicapp.dashboard;


import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.DashboardResponse;

public interface DashboardService {
    public DashboardResponse getDashboard(Long userId);
}
