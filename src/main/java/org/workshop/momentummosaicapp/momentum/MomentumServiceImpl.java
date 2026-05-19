package org.workshop.momentummosaicapp.momentum;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLog;
import org.workshop.momentummosaicapp.fitness.DailyFitnessLogRepository;
import org.workshop.momentummosaicapp.momentum.dto.MomentumSummary;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskRepository;
import org.workshop.momentummosaicapp.task.TaskStatus;
import org.workshop.momentummosaicapp.task.TaskType;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MomentumServiceImpl implements MomentumService {

    private static final ZoneId APP_ZONE = ZoneId.systemDefault();

    private final MomentumSnapshotRepository snapshotRepository;
    private final TaskRepository taskRepository;
    private final DailyFitnessLogRepository dailyFitnessLogRepository;
    private final AppUserRepository appUserRepository;
    private final MomentumCalculator calculator;

    @Override
    @Transactional
    public MomentumSummary computeForUser(Long userId) {
        LocalDate today = LocalDate.now(APP_ZONE);

        // 1. Calculate raw signals from the DB
        List<Task> completedTasksForDay = getCompletedTasksForDay(userId, today);
        double completedDeepMinutes = calculateCompletedDeepMinutes(completedTasksForDay);
        double completedMinutes = calculateCompletedMinutes(completedTasksForDay);
        double remainingPlannedMinutes = taskRepository.remainingPlannedMinutesForDate(userId, today);
        boolean didWorkout = dailyFitnessLogRepository
                .findByAppUserIdAndDate(userId, today)
                .map(DailyFitnessLog::isDidWorkout)
                .orElse(false);
        double focusMinutes = calculateFocusMinutes(completedTasksForDay);

        // 2. Delegate daily score calculation to the pure calculator
        double dailyScore = calculator.calculateDailyRhythmScore(
                completedDeepMinutes,
                completedMinutes,
                remainingPlannedMinutes,
                didWorkout,
                focusMinutes
        );

        // 3. Fetch previous snapshot strictly BEFORE today (prevents EWMA compounding bugs)
        MomentumSnapshot previous = snapshotRepository
                .findTopByAppUserIdAndDateBeforeOrderByDateDesc(userId, today)
                .orElse(null);

        double previousMomentum = previous != null
                ? calculator.applyDecay(previous.getRollingMomentum(), previous.getDate(), today)
                : 0.5;

        // 4. Calculate rolling momentum
        double rollingMomentum = (MomentumCalculator.ALPHA * dailyScore) 
                + ((1 - MomentumCalculator.ALPHA) * previousMomentum);

        // 5. Apply recovery bonus if eligible
        List<MomentumSnapshot> historyBeforeToday = snapshotRepository
                .findTop7ByAppUserIdAndDateBeforeOrderByDateDesc(userId, today);
        
        List<Double> recentMomentums = historyBeforeToday.stream()
                .map(MomentumSnapshot::getRollingMomentum)
                .toList();

        if (calculator.isRecoveryEligible(recentMomentums) && dailyScore > 0.4) {
            rollingMomentum += MomentumCalculator.RECOVERY_BONUS;
        }
        rollingMomentum = Math.max(MomentumCalculator.FLOOR, Math.min(1.0, rollingMomentum));

        // 6. Determine trend and state using calculator
        MomentumTrend trend = calculator.determineTrend(rollingMomentum, recentMomentums);
        
        boolean recoveryEligibleForState = calculator.isRecoveryEligible(recentMomentums);
        MomentumState state = calculator.determineState(rollingMomentum, trend, recoveryEligibleForState);

        // 7. Persist snapshot (Insert or Update today's existing snapshot to avoid database crashes)
        MomentumSnapshot snapshot = snapshotRepository
                .findByAppUserIdAndDate(userId, today)
                .orElseGet(() -> {
                    MomentumSnapshot newSnapshot = new MomentumSnapshot();
                    newSnapshot.setDate(today);
                    newSnapshot.setAppUser(getUserOrThrow(userId));
                    return newSnapshot;
                });

        snapshot.setDailyRhythmScore(dailyScore);
        snapshot.setRollingMomentum(rollingMomentum);
        snapshot.setMomentumState(state);
        snapshot.setTrend(trend);

        snapshotRepository.save(snapshot);

        return MomentumSummary.builder()
                .state(state.name())
                .displayLabel(state.getDisplayLabel())
                .trend(trend.name())
                .rhythmPosition(calculator.calculateRhythmPosition(state, rollingMomentum))
                .contextMessage(contextMessageFor(state))
                .build();
    }

    private double calculateCompletedDeepMinutes(List<Task> completedTasksForDay) {
        return completedTasksForDay.stream()
                .filter(task -> task.getTaskType() == TaskType.DEEP)
                .mapToDouble(task -> task.getActualMinutes() != null
                        ? task.getActualMinutes()
                        : task.getDurationMinutes())
                .sum();
    }

    private double calculateCompletedMinutes(List<Task> completedTasksForDay) {
        return completedTasksForDay.stream()
                .mapToDouble(task -> task.getActualMinutes() != null
                        ? task.getActualMinutes()
                        : task.getDurationMinutes())
                .sum();
    }

    private double calculateFocusMinutes(List<Task> completedTasksForDay) {
        return completedTasksForDay.stream()
                .filter(task -> task.getStartedAt() != null && task.getActualMinutes() != null)
                .mapToDouble(Task::getActualMinutes)
                .sum();
    }

    private List<Task> getCompletedTasksForDay(Long userId, LocalDate date) {
        Instant startOfDay = date.atStartOfDay(APP_ZONE).toInstant();
        Instant endOfDay = date.plusDays(1).atStartOfDay(APP_ZONE).toInstant();
        return taskRepository.findByAppUserIdAndStatusAndCompletedAtBetween(
                userId,
                TaskStatus.COMPLETED,
                startOfDay,
                endOfDay
        );
    }

    private String contextMessageFor(MomentumState state) {
        return switch (state) {
            case DORMANT -> "Your workspace is ready when you are.";
            case RECOVERING -> "Welcome back. One session is all it takes.";
            case BUILDING -> "Momentum building. Keep showing up.";
            case STEADY -> "Consistent rhythm. This is where growth happens.";
            case STRONG -> "Strong week. Your focus is paying off.";
            case LOCKED_IN -> "Peak execution. Protect this rhythm.";
            case COOLING -> "Natural rhythm. Every cycle has ebbs.";
        };
    }

    private AppUser getUserOrThrow(Long userId) {
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }
}
