package org.workshop.momentummosaicapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskRequest;
import org.workshop.momentummosaicapp.task.TaskService;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    @PostMapping("/{userId}")
    public Task createTask(@PathVariable Long userId, @RequestBody TaskRequest request){
        return null;
    }
    @PutMapping("/{userId}/{taskId}")
    public Task updateTask(
            @PathVariable Long userId,
            @PathVariable Long taskId,
            @RequestBody TaskRequest request){
        return null;
    }
    @DeleteMapping("/{userId}/{taskId}")
    public void deleteTask(@PathVariable Long userId,
                           @PathVariable Long taskId){}

    @PutMapping("/{userId}/{taskId}/complete")
    public Task completeTask(@PathVariable Long userId,
                             @PathVariable Long taskId){
        return null;
    }

    @GetMapping("/active/{userId}")
    public List<Task> getActiveTasks(@PathVariable Long userId){
        return null;
    }

    @GetMapping("/completed/{userId}")
    public List<Task> getCompletedTasks(@PathVariable Long userId){
        return null;
    }
}
