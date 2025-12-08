package org.workshop.momentummosaicapp.dashboard;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.*;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLogRepository;
import org.workshop.momentummosaicapp.fitness.FitnessService;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskRepository;
import org.workshop.momentummosaicapp.task.TaskType;
import org.workshop.momentummosaicapp.user.User;
import org.workshop.momentummosaicapp.user.UserRepository;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService{

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final DailyFitnessLogRepository fitnessLogRepository;
    private final FitnessService fitnessService;

    @Override
    public DashboardResponse getDashboard(Long userId) {
        User user = getUserOrThrow(userId);
        double proteinMin = user.getWeightKg()*1.6;
        double proteinMax = user.getWeightKg()*2.2;
        //calculating calorie targets
        int maintenance = user.getWeightKg()*33;
        int cut = maintenance-300;
        int bulk = maintenance+300;
        UserSummary userSummary = UserSummary.builder().heightCm(user.getHeightCm())
                .weightKg(user.getWeightKg())
                .gender(user.getGender())
                .caloriesCut(cut)
                .caloriesBulk(bulk)
                .proteinMax(proteinMax)
                .proteinMin(proteinMin)
                .caloriesMaintenance(maintenance)
                .build();

        List<Task> active = taskRepository.findByUserIdAndCompletedFalse(userId);
        List<Task> completed = taskRepository.findByUserIdAndCompletedTrue(userId);
        List<TaskItem> activeItems= active.stream().map(task -> toTaskItem(task)
        ).toList();
        List<TaskItem> completedItems= completed.stream().map(task -> toTaskItem(task)
        ).toList();
        int totalDeepMinutes = completedItems.stream().filter(task -> task.getTaskType() == TaskType.DEEP).mapToInt(TaskItem::getDurationMinutes).sum();
        int totalShallowMinutes = completedItems.stream().filter(task -> task.getTaskType()== (TaskType.SHALLOW)).mapToInt(TaskItem::getDurationMinutes).sum();
        int totalFitnessMinutes = completedItems.stream().filter(task -> task.getTaskType()== (TaskType.FITNESS)).mapToInt(TaskItem::getDurationMinutes).sum();


        TaskSummary taskSummary = TaskSummary.builder().activeTasks(activeItems).completedTasks(completedItems).totalDeepMinutes(totalDeepMinutes).totalFitnessMinutes(totalFitnessMinutes).totalShallowMinutes(totalShallowMinutes).build();
        Optional<DailyFitnessLog> todayLog = fitnessService.getTodayLog(userId);
        boolean didWorkoutToday = todayLog.map(DailyFitnessLog::isDidWorkout).orElse(false);
        int totalWorkoutDays = fitnessService.getTotalWorkoutDays(userId);
        int streak = fitnessService.getWorkoutStreak(userId);
        FitnessSummary fitnessSummary = FitnessSummary.builder().didWorkoutToday(didWorkoutToday).totalWorkoutDays(totalWorkoutDays).workoutStreak(streak).build();

        return
                DashboardResponse.builder().taskSummary(taskSummary).fitnessSummary(fitnessSummary).userSummary(userSummary).build();
    }
    private User getUserOrThrow(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User Not Found"));
    }
    private TaskItem toTaskItem(Task task){
        return TaskItem.builder()
                .taskType(task.getTaskType())
                .id(task.getId())
                .completedAt(task.getCompletedAt())
                .title(task.getTitle())
                .durationMinutes(task.getDurationMinutes())
                .completed(task.isCompleted())
                .build();
    }
}
