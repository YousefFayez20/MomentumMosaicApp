package org.workshop.momentummosaicapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskService;
import org.workshop.momentummosaicapp.task.dto.TaskRequest;
import org.workshop.momentummosaicapp.task.dto.TaskResponse;
import org.workshop.momentummosaicapp.utility.DtoMapper;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class TaskController {

    private final TaskService taskService;
    private final DtoMapper dtoMapper;

    @PostMapping("/{userId}")
    public TaskResponse createTask(@PathVariable Long userId, @RequestBody @Valid TaskRequest request){
        Task task = taskService.createTask(request.getTitle(),userId,request.getTaskType(),request.getDurationMinutes());
        return dtoMapper.taskToTaskResponse(task);
    }
    @PutMapping("/{userId}/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long userId,
            @PathVariable Long taskId,
            @RequestBody @Valid TaskRequest request){

        Task task = taskService.updateTask(userId,taskId,request.getTitle(),request.getTaskType(),request.getDurationMinutes());
        return dtoMapper.taskToTaskResponse(task);
    }
    @DeleteMapping("/{userId}/{taskId}")
    public void deleteTask(@PathVariable Long userId,
                           @PathVariable Long taskId){
        taskService.deleteTask(userId,taskId);
    }

    @PutMapping("/{userId}/{taskId}/complete")
    public TaskResponse completeTask(@PathVariable Long userId,
                             @PathVariable Long taskId){
        Task task = taskService.completeTask(userId,taskId);
        return dtoMapper.taskToTaskResponse(task);
    }

    @GetMapping("/active/{userId}")
    public List<TaskResponse> getActiveTasks(@PathVariable Long userId){
        List<Task> tasks = taskService.getActiveTasks(userId);

        return tasks.stream().map(dtoMapper::taskToTaskResponse).toList();
    }

    @GetMapping("/completed/{userId}")
    public List<TaskResponse> getCompletedTasks(@PathVariable Long userId){
        List<Task> tasks = taskService.getCompletedTasks(userId);
        return tasks.stream().map(dtoMapper::taskToTaskResponse).toList();
    }
}
