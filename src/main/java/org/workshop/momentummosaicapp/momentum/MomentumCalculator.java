package org.workshop.momentummosaicapp.momentum;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class MomentumCalculator {

    public static final double ALPHA = 0.3;
    public static final double DECAY_RATE = 0.92;
    public static final double FLOOR = 0.15;
    public static final double RECOVERY_BONUS = 0.08;
    public static final int DEEP_WORK_TARGET = 90;

    public double calculateDailyRhythmScore(
            double completedDeepMinutes,
            double completedMinutes,
            double remainingPlannedMinutes,
            boolean didWorkout,
            double focusMinutes
    ) {
        if (completedMinutes == 0 && remainingPlannedMinutes == 0) {
            return 0.5;
        }

        // Deep Work Presence (35%)
        double deepWorkPresence = Math.min(1.0, completedDeepMinutes / DEEP_WORK_TARGET);

        // Follow Through (25%)
        double followThrough;
        if ((completedMinutes + remainingPlannedMinutes) == 0) {
            followThrough = 0.5;
        } else {
            followThrough = completedMinutes / (completedMinutes + remainingPlannedMinutes);
        }

        // Workout Signal (20%)
        double workoutSignal = didWorkout ? 1.0 : 0.0;

        // Intentionality Signal (20%)
        double intentionality = completedMinutes > 0
                ? Math.max(0.3, Math.min(1.0, focusMinutes / completedMinutes))
                : 0.3;

        return (deepWorkPresence * 0.35)
                + (followThrough * 0.25)
                + (workoutSignal * 0.20)
                + (intentionality * 0.20);
    }

    public double applyDecay(double momentum, LocalDate previousDate, LocalDate today) {
        long daysMissed = ChronoUnit.DAYS.between(previousDate, today);
        double decayed = momentum;
        // If daysMissed is 1, they were active yesterday (0 days missed).
        // If daysMissed is 2, they missed yesterday (1 day missed).
        // We only decay for actual missed days (daysMissed - 1).
        for (int i = 1; i < daysMissed; i++) {
            decayed = Math.max(FLOOR, decayed * DECAY_RATE);
        }
        return decayed;
    }

    public boolean isRecoveryEligible(List<Double> recentMomentums) {
        return recentMomentums.stream().anyMatch(m -> m < 0.25);
    }

    public MomentumTrend determineTrend(double todayMomentum, List<Double> historyMomentums) {
        if (historyMomentums.isEmpty()) {
            return MomentumTrend.STABLE;
        }
        // historyMomentums should be ordered by date desc (latest first)
        // Compare today with 3 days ago (index 2 in history) or the oldest available
        double oldMomentum = historyMomentums.get(Math.min(2, historyMomentums.size() - 1));
        double delta = todayMomentum - oldMomentum;

        if (delta > 0.03) return MomentumTrend.RISING;
        if (delta < -0.03) return MomentumTrend.FALLING;

        return MomentumTrend.STABLE;
    }

    public MomentumState determineState(double momentum, MomentumTrend trend, boolean recoveryEligible) {
        if (momentum <= 0.20) return MomentumState.DORMANT;

        if (recoveryEligible && trend == MomentumTrend.RISING && momentum <= 0.40) {
            return MomentumState.RECOVERING;
        }

        if (trend == MomentumTrend.FALLING && momentum >= 0.40 && momentum <= 0.70) {
            return MomentumState.COOLING;
        }

        if (momentum <= 0.55) return MomentumState.BUILDING;
        if (momentum <= 0.65) return MomentumState.STEADY;
        if (momentum <= 0.80) return MomentumState.STRONG;

        return MomentumState.LOCKED_IN;
    }

    public double calculateRhythmPosition(MomentumState state, double momentum) {
        double position = switch (state) {
            case DORMANT -> momentum / 0.20;
            case RECOVERING -> (momentum - 0.15) / 0.25;
            case BUILDING -> (momentum - 0.30) / 0.25;
            case STEADY -> (momentum - 0.45) / 0.20;
            case STRONG -> (momentum - 0.60) / 0.20;
            case LOCKED_IN -> (momentum - 0.75) / 0.25;
            case COOLING -> (momentum - 0.40) / 0.30;
        };
        return Math.max(0.0, Math.min(1.0, position));
    }
}
