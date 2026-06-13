package org.workshop.momentummosaicapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskService;
import org.workshop.momentummosaicapp.task.dto.TaskRequest;
import org.workshop.momentummosaicapp.task.dto.TaskResponse;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import org.workshop.momentummosaicapp.utility.DtoMapper;
import org.workshop.momentummosaicapp.utility.exception.UnauthorizedException;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class TaskController {

    private final TaskService taskService;
    private final DtoMapper dtoMapper;

    @PostMapping()
    public TaskResponse createTask(Authentication authentication, @RequestBody @Valid TaskRequest request){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        Task task = taskService.createTask(
                request.getTitle(),
                userId,
                request.getTaskType(),
                request.getDurationMinutes(),
                request.getPlannedForDate(),
                request.getWorkspaceId()
        );
        return dtoMapper.taskToTaskResponse(task);
    }
    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
            Authentication authentication,
            @PathVariable Long taskId,
            @RequestBody @Valid TaskRequest request){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();

        Task task = taskService.updateTask(
                userId,
                taskId,
                request.getTitle(),
                request.getTaskType(),
                request.getDurationMinutes(),
                request.getPlannedForDate(),
                request.getWorkspaceId()
        );
        return dtoMapper.taskToTaskResponse(task);
    }
    @DeleteMapping("/{taskId}")
    public void deleteTask(Authentication authentication,
                           @PathVariable Long taskId){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        taskService.deleteTask(userId,taskId);
    }

    @PutMapping("/{taskId}/start")
    public TaskResponse startTask(Authentication authentication,
                                     @PathVariable Long taskId){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        Task task = taskService.startTask(userId,taskId);
        return dtoMapper.taskToTaskResponse(task);
    }

    @PutMapping("/{taskId}/complete")
    public TaskResponse completeTask(Authentication authentication,
                             @PathVariable Long taskId){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        Task task = taskService.completeTask(userId,taskId);
        return dtoMapper.taskToTaskResponse(task);
    }
    @PutMapping("/{taskId}/abandon")
    public TaskResponse abandonTask(Authentication authentication,
                                     @PathVariable Long taskId){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        Task task = taskService.abandonTask(userId,taskId);
        return dtoMapper.taskToTaskResponse(task);
    }

    @GetMapping("/active")
    public List<TaskResponse> getActiveTasks(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        List<Task> tasks = taskService.getActiveTasks(userId);

        return tasks.stream().map(dtoMapper::taskToTaskResponse).toList();
    }

    @GetMapping("/completed")
    public List<TaskResponse> getCompletedTasks(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        List<Task> tasks = taskService.getCompletedTasks(userId);
        return tasks.stream().map(dtoMapper::taskToTaskResponse).toList();
    }
    @PutMapping("/{taskId}/workspace/{workspaceId}")
    public TaskResponse linkTaskToWorkspace(
            Authentication authentication,
            @PathVariable Long taskId,
            @PathVariable Long workspaceId) {
        Long userId = extractUserId(authentication);
        Task task = taskService.linkToWorkspace(userId, taskId, workspaceId);
        return dtoMapper.taskToTaskResponse(task);
    }
    private Long extractUserId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrincipal)) {
            throw new UnauthorizedException("User not authenticated");
        }
        return ((AppUserPrincipal) auth.getPrincipal()).getUserId();
    }
    @DeleteMapping("/{taskId}/workspace")
    public TaskResponse unlinkTaskFromWorkspace(
            Authentication authentication,
            @PathVariable Long taskId) {
        Long userId = extractUserId(authentication);
        Task task = taskService.unlinkFromWorkspace(userId, taskId);
        return dtoMapper.taskToTaskResponse(task);
    }
}
