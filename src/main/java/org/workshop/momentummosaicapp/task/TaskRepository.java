package org.workshop.momentummosaicapp.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task,Long>{
    List<Task> findByAppUserIdAndStatusNot(Long userId, TaskStatus status);
    List<Task> findByAppUserIdAndStatus(Long userId, TaskStatus status);
    List<Task> findByAppUserIdAndCompletedTrue(Long userId);
    List<Task> findByAppUserIdAndStatusAndCompletedAtBetween(
            Long userId,
            TaskStatus status,
            Instant start,
            Instant end
    );

    @Query("""
        SELECT COALESCE(SUM(t.durationMinutes), 0)
        FROM Task t
        WHERE t.appUser.id = :userId
        AND t.plannedForDate = :plannedForDate
        AND t.status <> org.workshop.momentummosaicapp.task.TaskStatus.COMPLETED
    """)
    double remainingPlannedMinutesForDate(
            @Param("userId") Long userId,
            @Param("plannedForDate") LocalDate plannedForDate
    );
    // Derives total focus minutes for a workspace from completed task execution time.
// This is why we don't need a FocusSession entity — the data already exists.
    @Query("SELECT COALESCE(SUM(t.actualMinutes), 0) FROM Task t " +
            "WHERE t.workspace.id = :wsId AND t.status = org.workshop.momentummosaicapp.task.TaskStatus.COMPLETED")
    int sumActualMinutesByWorkspaceId(@Param("wsId") Long workspaceId);
    // Get all tasks linked to a workspace for the execution list
    List<Task> findByWorkspaceIdAndStatusNot(Long workspaceId, TaskStatus status);
}
