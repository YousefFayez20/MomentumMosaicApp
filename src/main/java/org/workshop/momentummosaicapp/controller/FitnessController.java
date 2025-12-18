package org.workshop.momentummosaicapp.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.UserSummary;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.FitnessService;
import org.workshop.momentummosaicapp.fitness.dto.FitnessLogResponse;
import org.workshop.momentummosaicapp.fitness.dto.WorkoutRequest;
import org.workshop.momentummosaicapp.utility.DtoMapper;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/fitness")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class FitnessController {
    private final FitnessService fitnessService;
    private final DtoMapper dtoMapper;
    @PostMapping("/{userId}/workout")
    public void markWorkoutToday(@PathVariable Long userId, @RequestBody @Valid WorkoutRequest request){
        fitnessService.markWorkoutToday(userId, request.getDidWorkout());
    }
    @GetMapping("/{userId}/today")
    public FitnessLogResponse getToday(@PathVariable Long userId){
        DailyFitnessLog dailyFitnessLog = fitnessService.getTodayLog(userId).orElseThrow(()-> new ResourceNotFoundException("No log found for today"));
        return dtoMapper.dailyFitnessLogToFitnessLogResponse(dailyFitnessLog);
    }
    @GetMapping("/{userId}/total-days")
    public int getTotalWorkoutDays(@PathVariable Long userId){
        return fitnessService.getTotalWorkoutDays(userId);
    }
    @GetMapping("/{userId}/streak")
    public int getWorkoutStreak(@PathVariable Long userId){
        return fitnessService.getWorkoutStreak(userId);
    }
    @GetMapping("/{userId}/macros")
    public UserSummary getMacros(@PathVariable Long userId){
        return fitnessService.getUserSummary(userId);
    }


}
