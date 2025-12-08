package org.workshop.momentummosaicapp.task;

import java.util.List;

public interface TaskService {

    //by default completed will be false when created
    public Task createTask(String title, Long userId ,TaskType taskType,Integer durationMinutes);
    public Task updateTask(Long userId,Long taskId,String title, TaskType taskType,Integer durationMinutes);
    public void deleteTask(Long userId,Long taskId);
    public Task completeTask(Long userId,Long taskId);
    public List<Task> getActiveTasks(Long userId);
    public List<Task> getCompletedTasks(Long userId);


}
