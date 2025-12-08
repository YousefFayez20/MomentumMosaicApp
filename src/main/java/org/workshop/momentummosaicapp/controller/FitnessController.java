package org.workshop.momentummosaicapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.FitnessService;
import org.workshop.momentummosaicapp.fitness.WorkoutRequest;

@RestController
@RequestMapping("/api/fitness")
@RequiredArgsConstructor
public class FitnessController {
    private final FitnessService fitnessService;
    @PostMapping("/{userId}/workout")
    public void markWorkoutToday(@PathVariable Long userId, @RequestBody WorkoutRequest request){

    }
    @GetMapping("/{userId}/today")
    public DailyFitnessLog getToday(@PathVariable Long userId){
        return null;
    }
    @GetMapping("/{userId}/total-days")
    public int getTotalWorkoutDays(@PathVariable Long userId){
        return 0;
    }
    @GetMapping("/{userId}/streak")
    public int getWorkoutStreak(@PathVariable Long userId){
        return 0;
    }

}
