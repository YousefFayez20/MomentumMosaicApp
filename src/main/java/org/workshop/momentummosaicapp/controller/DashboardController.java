package org.workshop.momentummosaicapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.DashboardResponse;
import org.workshop.momentummosaicapp.dashboard.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;
    @GetMapping("/{userId}")
    public DashboardResponse getDashboard(@PathVariable Long userId){
        return dashboardService.getDashboard(userId);
    }
}
