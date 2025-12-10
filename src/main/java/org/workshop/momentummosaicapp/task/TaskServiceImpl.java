package org.workshop.momentummosaicapp.task;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.user.User;
import org.workshop.momentummosaicapp.user.UserRepository;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ForbiddenException;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService{

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public Task createTask(String title, Long userId, TaskType taskType, Integer durationMinutes) {
       validateTaskDuration(taskType,durationMinutes);
        User user = getUserOrThrow(userId);
        Task task = new Task();
        task.setTitle(title);
        task.setTaskType(taskType);
        task.setUser(user);
        task.setDurationMinutes(durationMinutes);
        task.setCompleted(false);
        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Long userId, Long taskId, String title, TaskType taskType, Integer durationMinutes) {
       Task task = getTaskOrThrow(taskId);
       validateOwnership(userId,task);
       if(task.isCompleted()) throw new IllegalArgumentException("Cannot update a completed task");
       validateTaskDuration(taskType,durationMinutes);
       task.setTitle(title);
       task.setTaskType(taskType);
       task.setDurationMinutes(durationMinutes);
        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long userId, Long taskId) {
        Task task = getTaskOrThrow(taskId);
        validateOwnership(userId,task);
        taskRepository.delete(task);
    }

    @Override
    public Task completeTask(Long userId, Long taskId) {
        User user = getUserOrThrow(userId);
        Task task = getTaskOrThrow(taskId);
        validateOwnership(userId,task);
        if (task.isCompleted()) return task;
        task.setCompleted(true);
        task.setCompletedAt(Instant.now());
        return taskRepository.save( task);
    }

    @Override
    public List<Task> getActiveTasks(Long userId) {
        User user = getUserOrThrow(userId);
        return taskRepository.findByUserIdAndCompletedFalse(userId);
    }

    @Override
    public List<Task> getCompletedTasks(Long userId) {
        User user = getUserOrThrow(userId);
        return taskRepository.findByUserIdAndCompletedTrue(userId);
    }
    private void validateTaskDuration(TaskType type, int durationMinutes){
        if(durationMinutes<=0){
            throw new BadRequestException("Duration must be greater than zero.");
        }
        if(type == TaskType.DEEP && durationMinutes < 120){
            throw new BadRequestException("Deep Task should be at least 2 hours");
        }
    }
    private User getUserOrThrow(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }
    private Task getTaskOrThrow(Long taskId){
        return taskRepository.findById(taskId).orElseThrow(()-> new ResourceNotFoundException("task doesn't exist"));
    }
    private void validateOwnership(Long userId,Task task){
        if(!task.getUser().getId().equals(userId)){
            throw new ForbiddenException("Task does not belong to this user");
        }
    }
}
