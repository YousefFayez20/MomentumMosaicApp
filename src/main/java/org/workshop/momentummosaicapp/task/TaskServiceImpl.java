package org.workshop.momentummosaicapp.task;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ConflictException;
import org.workshop.momentummosaicapp.utility.exception.ForbiddenException;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService{

    private final TaskRepository taskRepository;
    private final AppUserRepository appUserRepository;

    @Override
    public Task createTask(String title, Long userId, TaskType taskType, Integer durationMinutes, LocalDate plannedForDate) {
       validateTaskDuration(taskType,durationMinutes);
        AppUser appUser = getUserOrThrow(userId);
        Task task = new Task();
        task.setTitle(title);
        task.setTaskType(taskType);
        task.setAppUser(appUser);
        task.setDurationMinutes(durationMinutes);
        task.setPlannedForDate(resolvePlannedForDate(plannedForDate));
        task.setStatus(TaskStatus.PLANNED);
        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Long userId, Long taskId, String title, TaskType taskType, Integer durationMinutes, LocalDate plannedForDate) {
       Task task = getTaskOrThrow(taskId);
       validateOwnership(userId,task);
       if(task.isCompleted()) throw new BadRequestException("Cannot update a completed task");
       validateTaskDuration(taskType,durationMinutes);
       task.setTitle(title);
       task.setTaskType(taskType);
       task.setDurationMinutes(durationMinutes);
       task.setPlannedForDate(resolvePlannedForDate(plannedForDate));
        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long userId, Long taskId) {
        Task task = getTaskOrThrow(taskId);
        validateOwnership(userId,task);
        taskRepository.delete(task);
    }

    @Override
    public Task startTask(Long userId, Long taskId) {
        Task task = getTaskOrThrow(taskId);
        validateOwnership(userId, task);
        if (task.getStatus() != TaskStatus.PLANNED) {
            throw new BadRequestException("Task must be in PLANNED state to start");
        }
        if(!taskRepository.findByAppUserIdAndStatus(userId, TaskStatus.IN_PROGRESS).isEmpty()){
           throw new ConflictException("You Can't start another task while you there's another task in progress");
        }
        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setStartedAt(Instant.now());
        return taskRepository.save(task);
    }

    @Override
    public Task completeTask(Long userId, Long taskId) {
        Task task = getTaskOrThrow(taskId);
        validateOwnership(userId, task);
        if (task.getStatus() == TaskStatus.COMPLETED) return task;

        Instant now = Instant.now();
        if (task.getStatus() == TaskStatus.IN_PROGRESS && task.getStartedAt() != null) {
            long diff = Duration.between(task.getStartedAt(), now).toMinutes();
            task.setActualMinutes((int) diff);
        } else {
            // If completed directly from PLANNED, actual = estimated
            task.setActualMinutes(task.getDurationMinutes());
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(now);
        return taskRepository.save(task);
    }

    @Override
    public Task abandonTask(Long userId, Long taskId) {
        Task task = getTaskOrThrow(taskId);
        validateOwnership(userId, task);
        if(task.getStatus().equals(TaskStatus.IN_PROGRESS)){
            task.setStatus(TaskStatus.PLANNED);
        }else {
            throw new BadRequestException("You can abandon only in progress tasks");
        }
        task.setStartedAt(null);
        task.setActualMinutes(null);
        return taskRepository.save(task);
    }

    @Override
    public List<Task> getActiveTasks(Long userId) {
        AppUser appUser = getUserOrThrow(userId);
        return taskRepository.findByAppUserIdAndStatusNot(userId, TaskStatus.COMPLETED);
    }

    @Override
    public List<Task> getCompletedTasks(Long userId) {
        AppUser appUser = getUserOrThrow(userId);
        return taskRepository.findByAppUserIdAndCompletedTrue(userId);
    }
    private void validateTaskDuration(TaskType type, int durationMinutes){
        if(durationMinutes<=0){
            throw new BadRequestException("Duration must be greater than zero.");
        }
        if(type == TaskType.DEEP && durationMinutes < 120){
            throw new BadRequestException("Deep Task should be at least 2 hours");
        }
    }
    private AppUser getUserOrThrow(Long userId){
        return appUserRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }
    private Task getTaskOrThrow(Long taskId){
        return taskRepository.findById(taskId).orElseThrow(()-> new ResourceNotFoundException("task doesn't exist"));
    }
    private void validateOwnership(Long userId,Task task){
        if(!task.getAppUser().getId().equals(userId)){
            throw new ForbiddenException("Task does not belong to this user");
        }
    }

    private LocalDate resolvePlannedForDate(LocalDate plannedForDate) {
        return plannedForDate != null ? plannedForDate : LocalDate.now();
    }
}
