package org.workshop.momentummosaicapp.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task,Long>{
    List<Task> findByAppUserIdAndStatusNot(Long userId, TaskStatus status);
    List<Task> findByAppUserIdAndStatus(Long userId, TaskStatus status);
    List<Task> findByAppUserIdAndCompletedTrue(Long userId);
}
