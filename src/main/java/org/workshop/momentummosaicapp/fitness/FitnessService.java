package org.workshop.momentummosaicapp.fitness;

import java.util.Optional;

public interface FitnessService {
    public void markWorkoutToday(Long userId,boolean didWorkout);
    public int getTotalWorkoutDays(Long userId);
    public int getWorkoutStreak(Long userId);
    Optional<DailyFitnessLog> getTodayLog(Long userId);


}
