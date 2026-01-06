package org.workshop.momentummosaicapp.fitness;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyFitnessLogRepository extends JpaRepository<DailyFitnessLog,Long> {
    Optional<DailyFitnessLog> findByAppUserIdAndDate(Long userId, LocalDate date);
    List<DailyFitnessLog> findByAppUserId(Long userId);
}