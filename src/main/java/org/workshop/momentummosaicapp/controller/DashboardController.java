package org.workshop.momentummosaicapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.DashboardResponse;
import org.workshop.momentummosaicapp.dashboard.DashboardService;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;


@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class DashboardController {
    private final DashboardService dashboardService;
    @GetMapping()
    public DashboardResponse getDashboard(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        return dashboardService.getDashboard(userId);
    }
}
