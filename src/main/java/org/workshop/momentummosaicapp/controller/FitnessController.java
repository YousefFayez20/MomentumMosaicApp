package org.workshop.momentummosaicapp.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.UserSummary;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.FitnessService;
import org.workshop.momentummosaicapp.fitness.dto.FitnessLogResponse;
import org.workshop.momentummosaicapp.fitness.dto.WorkoutRequest;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import org.workshop.momentummosaicapp.utility.DtoMapper;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/fitness")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class FitnessController {
    private final FitnessService fitnessService;
    private final DtoMapper dtoMapper;
    @PostMapping("/workout")
    public void markWorkoutToday(Authentication authentication, @RequestBody @Valid WorkoutRequest request){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        fitnessService.markWorkoutToday(userId, request.getDidWorkout());
    }
    @GetMapping("/today")
    public FitnessLogResponse getToday(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        DailyFitnessLog dailyFitnessLog = fitnessService.getTodayLog(userId).orElseThrow(()-> new ResourceNotFoundException("No log found for today"));
        return dtoMapper.dailyFitnessLogToFitnessLogResponse(dailyFitnessLog);
    }
    @GetMapping("/total-days")
    public int getTotalWorkoutDays(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        return fitnessService.getTotalWorkoutDays(userId);
    }
    @GetMapping("/streak")
    public int getWorkoutStreak(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        return fitnessService.getWorkoutStreak(userId);
    }
    @GetMapping("/{userId}/macros")
    public UserSummary getMacros(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        return fitnessService.getUserSummary(userId);
    }


}
