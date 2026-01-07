package org.workshop.momentummosaicapp.fitness;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FitnessServiceImplTest {
    @Mock
    DailyFitnessLogRepository dailyFitnessLogRepository;
    @Mock
    AppUserRepository appUserRepository;
    @InjectMocks
    FitnessServiceImpl fitnessService;

    @Test
    void markWorkoutToday() {
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));
        when(dailyFitnessLogRepository.findByAppUserIdAndDate(eq(userId),any(LocalDate.class))).thenReturn(Optional.empty());
        when(dailyFitnessLogRepository.save(any(DailyFitnessLog.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        fitnessService.markWorkoutToday(userId,true);
        ArgumentCaptor<DailyFitnessLog> captor =
                ArgumentCaptor.forClass(DailyFitnessLog.class);

        verify(dailyFitnessLogRepository, atLeastOnce())
                .save(captor.capture());

        DailyFitnessLog saved = captor.getValue();
        assertTrue(saved.isDidWorkout());
    }

    @Test
    void getTotalWorkoutDays() {
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));
        when(dailyFitnessLogRepository.findByAppUserId(userId)).thenReturn(
                List.of(new DailyFitnessLog(1L,appUser,LocalDate.now(),true, Instant.now())
        ,new DailyFitnessLog(2L,appUser,LocalDate.now(),true, Instant.now())));
        int total =fitnessService.getTotalWorkoutDays(userId);
        assertEquals(2,total);
    }

    @Test
    void getWorkoutStreak() {
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        LocalDate  today =LocalDate.now();
        when(dailyFitnessLogRepository.findByAppUserId(userId)).thenReturn(
                new ArrayList<>(  List.of(new DailyFitnessLog(1L,appUser,today,true, Instant.now())
                        ,new DailyFitnessLog(2L,appUser,today.minusDays(1),true, Instant.now()),new DailyFitnessLog(3L,appUser,today.minusDays(2),true, Instant.now()))));
        int streak = fitnessService.getWorkoutStreak(userId);
        assertEquals(3,streak);

    }
    @Test
    void getWorkoutStreak_shouldReturnZeroWhenNoWorkoutToday() {
        Long userId = 1L;
        AppUser user = new AppUser();
        user.setId(userId);

        when(dailyFitnessLogRepository.findByAppUserId(userId))
                .thenReturn(new ArrayList<>(List.of(
                        new DailyFitnessLog(1L, user, LocalDate.now().minusDays(1), true, Instant.now())
                )));

        int streak = fitnessService.getWorkoutStreak(userId);

        assertEquals(0, streak);
    }



}