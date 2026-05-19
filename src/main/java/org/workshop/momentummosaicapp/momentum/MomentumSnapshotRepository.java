package org.workshop.momentummosaicapp.momentum;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MomentumSnapshotRepository extends JpaRepository<MomentumSnapshot,Long> {
    Optional<MomentumSnapshot> findTopByAppUserIdOrderByDateDesc(Long appUserId);
    List<MomentumSnapshot> findTop7ByAppUserIdOrderByDateDesc(Long appUserId);
    List<MomentumSnapshot> findTop14ByAppUserIdOrderByDateDesc(Long appUserId);
    Optional<MomentumSnapshot> findByAppUserIdAndDate(Long userId, LocalDate date);
    
    Optional<MomentumSnapshot> findTopByAppUserIdAndDateBeforeOrderByDateDesc(Long appUserId, LocalDate date);
    List<MomentumSnapshot> findTop7ByAppUserIdAndDateBeforeOrderByDateDesc(Long appUserId, LocalDate date);
}
