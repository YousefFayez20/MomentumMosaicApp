package org.workshop.momentummosaicapp.fitness;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyFitnessLogRepository extends JpaRepository<DailyFitnessLog,Long> {
    Optional<DailyFitnessLog> findByAppUserIdAndDate(Long userId, LocalDate date);
    List<DailyFitnessLog> findByAppUserId(Long userId);
    @Query("SELECT count(d) from DailyFitnessLog d where d.appUser.id = :userId and d.didWorkout =true")
    int countWorkoutDays(@Param("userId") Long userId);

    @Query("SELECT d from DailyFitnessLog d where d.appUser.id = :userId ORDER BY d.date DESC")
    List<DailyFitnessLog> findTopByAppUserIdOrderByDateDesc(@Param("userId") Long userId);
}