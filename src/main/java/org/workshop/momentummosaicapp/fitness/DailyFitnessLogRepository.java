package org.workshop.momentummosaicapp.fitness;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyFitnessLogRepository extends JpaRepository<DailyFitnessLog,Long> {
    Optional<DailyFitnessLog> findByAppUserIdAndDate(Long userId, LocalDate date);
    List<DailyFitnessLog> findByAppUserId(Long userId);
}
