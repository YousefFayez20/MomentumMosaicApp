package org.workshop.momentummosaicapp.utility;


import org.springframework.stereotype.Component;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.dto.FitnessLogResponse;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.dto.TaskResponse;
import org.workshop.momentummosaicapp.user.User;
import org.workshop.momentummosaicapp.user.dto.UserResponse;

@Component
public class DtoMapper {
    public TaskResponse taskToTaskResponse(Task task){
        TaskResponse taskResponse = new TaskResponse();
        taskResponse.setTaskType(task.getTaskType());
        taskResponse.setId(task.getId());
        taskResponse.setCompleted(task.isCompleted());
        taskResponse.setTitle(task.getTitle());
        taskResponse.setDurationMinutes(task.getDurationMinutes());
        taskResponse.setCompletedAt(task.getCompletedAt());
        return taskResponse;
    }
    public UserResponse userToUserResponse(User user){
        UserResponse userResponse = new UserResponse();
        userResponse.setGender(user.getGender());
        userResponse.setId(user.getId());
        userResponse.setName(user.getName());
        userResponse.setHeightCm(user.getHeightCm());
        userResponse.setWeightKg(user.getWeightKg());
        return userResponse;
    }
    public FitnessLogResponse dailyFitnessLogToFitnessLogResponse(DailyFitnessLog dailyFitnessLog){
        FitnessLogResponse fitnessLogResponse = new FitnessLogResponse();
        fitnessLogResponse.setDate(dailyFitnessLog.getDate());
        fitnessLogResponse.setDidWorkout(dailyFitnessLog.isDidWorkout());
        return fitnessLogResponse;
    }
}
