package org.workshop.momentummosaicapp.dashboard;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.DashboardResponse;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.FitnessSummary;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.TaskSummary;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLogRepository;
import org.workshop.momentummosaicapp.fitness.FitnessService;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskRepository;
import org.workshop.momentummosaicapp.task.TaskService;
import org.workshop.momentummosaicapp.task.TaskType;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.user.Gender;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {
    @Mock
    AppUserRepository appUserRepository;
    @Mock
    TaskRepository taskRepository;
    @Mock
    TaskService taskService;
    @Mock
    FitnessService fitnessService;
    @InjectMocks
    DashboardServiceImpl dashboardService;


    @Test
    void getDashboard() {
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        appUser.setWeightKg(80);
        appUser.setHeightCm(180);
        appUser.setGender(Gender.MALE);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));

        Task deepCompleted = new Task();
        deepCompleted.setId(1L);
        deepCompleted.setTitle("Deep Work");
        deepCompleted.setTaskType(TaskType.DEEP);
        deepCompleted.setDurationMinutes(120);
        deepCompleted.setCompleted(true);

        Task shallowCompleted = new Task();
        shallowCompleted.setId(2L);
        shallowCompleted.setTitle("Email");
        shallowCompleted.setTaskType(TaskType.SHALLOW);
        shallowCompleted.setDurationMinutes(30);
        shallowCompleted.setCompleted(true);

        Task activeTask = new Task();
        activeTask.setId(3L);
        activeTask.setTitle("Reading");
        activeTask.setTaskType(TaskType.FITNESS);
        activeTask.setDurationMinutes(45);
        activeTask.setCompleted(false);

        when(taskRepository.findByAppUserIdAndCompletedFalse(userId)).thenReturn(new ArrayList<>(List.of(activeTask)));
        when(taskRepository.findByAppUserIdAndCompletedTrue(userId)).thenReturn(new ArrayList<>(List.of(shallowCompleted,deepCompleted)));
        when(fitnessService.getTodayLog(userId)).thenReturn(Optional.of(new DailyFitnessLog()));
        when(fitnessService.getTotalWorkoutDays(userId)).thenReturn(10);
        when(fitnessService.getWorkoutStreak(userId)).thenReturn(3);
        //act
        DashboardResponse response = dashboardService.getDashboard(userId);
        // User summary
        assertEquals(80 * 33, response.getUserSummary().getCaloriesMaintenance());
        assertEquals(80 * 33 - 300, response.getUserSummary().getCaloriesCut());
        assertEquals(80 * 33 + 300, response.getUserSummary().getCaloriesBulk());

        // Task summary
        TaskSummary taskSummary = response.getTaskSummary();
        assertEquals(1, taskSummary.getActiveTasks().size());
        assertEquals(2, taskSummary.getCompletedTasks().size());
        assertEquals(120, taskSummary.getTotalDeepMinutes());
        assertEquals(30, taskSummary.getTotalShallowMinutes());
        assertEquals(0, taskSummary.getTotalFitnessMinutes());

        // Fitness summary
        FitnessSummary fitnessSummary = response.getFitnessSummary();
        assertFalse(fitnessSummary.isDidWorkoutToday());
        assertEquals(10, fitnessSummary.getTotalWorkoutDays());
        assertEquals(3, fitnessSummary.getWorkoutStreak());


    }
    @Test
    void shouldThrowIfUserNotFound() {
        when(appUserRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                dashboardService.getDashboard(1L)
        );

        verifyNoInteractions(taskRepository);
        verifyNoInteractions(fitnessService);
    }

}