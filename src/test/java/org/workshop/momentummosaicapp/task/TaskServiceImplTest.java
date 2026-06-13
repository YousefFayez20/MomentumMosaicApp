package org.workshop.momentummosaicapp.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ForbiddenException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TaskServiceImplTest {
    @Mock
    TaskRepository taskRepository;
    @Mock
    AppUserRepository appUserRepository;

    @InjectMocks
    TaskServiceImpl taskService;

    @Test
    void shouldCreateTaskSuccessfully() {
        //given
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        LocalDate plannedForDate = LocalDate.of(2026, 5, 19);
        Task task = taskService.createTask("Study",userId,TaskType.SHALLOW,60, plannedForDate, null);
        assertEquals("Study",task.getTitle());
        assertEquals(60, task.getDurationMinutes());
        assertEquals(plannedForDate, task.getPlannedForDate());
        assertFalse(task.isCompleted());
        assertEquals(appUser, task.getAppUser());
        verify(appUserRepository).findById(userId);
        verify(taskRepository).save(task);

    }
    @Test
    void shouldCreateTaskUnSuccessfully() {
        //given
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        assertThrows(BadRequestException.class,() ->taskService.createTask("Studying Docker",userId,TaskType.DEEP,90, LocalDate.now(), null));
        verifyNoInteractions(appUserRepository);
        verifyNoInteractions(taskRepository);
    }

    @Test
    void updateTaskSuccessfully() {
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        Task task = new Task();
        task.setCompleted(false);
        task.setTaskType(TaskType.FITNESS);
        task.setTitle("Gym");
        task.setDurationMinutes(60);
        task.setId(1L);
        task.setAppUser(appUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        LocalDate plannedForDate = LocalDate.of(2026, 5, 20);
        taskService.updateTask(1L,1L,"Gym",TaskType.FITNESS,60, plannedForDate, null);
        assertEquals("Gym",task.getTitle());
        assertEquals(60, task.getDurationMinutes());
        assertEquals(plannedForDate, task.getPlannedForDate());
        assertEquals(appUser, task.getAppUser());
        verify(taskRepository).save(task);
    }

    @Test
    void completeTask() {
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));
        Task task = new Task();
        task.setCompleted(false);
        task.setTaskType(TaskType.FITNESS);
        task.setTitle("Gym");
        task.setDurationMinutes(60);
        task.setId(1L);
        task.setAppUser(appUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        taskService.completeTask(userId,1L);
        assertTrue(task.isCompleted());
        verify(taskRepository).findById(1L);
        verify(appUserRepository).findById(userId);
    }
    @Test
    void shouldFailWhenUpdatingTaskNotOwnedByUser() {
        Task task = new Task();
        AppUser owner = new AppUser();
        owner.setId(2L);
        task.setAppUser(owner);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThrows(ForbiddenException.class, () ->
                taskService.updateTask(1L, 1L, "Hack", TaskType.FITNESS, 60, LocalDate.now(), null)
        );
    }

}
