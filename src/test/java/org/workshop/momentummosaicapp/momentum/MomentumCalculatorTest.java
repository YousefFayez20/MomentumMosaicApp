package org.workshop.momentummosaicapp.momentum;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MomentumCalculatorTest {

    private final MomentumCalculator calculator = new MomentumCalculator();

    @Test
    void testCalculateDailyRhythmScore_EmptyDay() {
        double score = calculator.calculateDailyRhythmScore(0, 0, 0, false, 0);
        assertEquals(0.5, score, 0.001);
    }

    @Test
    void testCalculateDailyRhythmScore_PerfectDay() {
        double score = calculator.calculateDailyRhythmScore(90, 90, 0, true, 90);
        // Deep work = 1.0 -> 0.35
        // Follow through = 1.0 -> 0.25
        // Workout = 1.0 -> 0.20
        // Intentionality = 1.0 -> 0.20
        // Total = 1.0
        assertEquals(1.0, score, 0.001);
    }

    @Test
    void testCalculateDailyRhythmScore_PartialDay() {
        double score = calculator.calculateDailyRhythmScore(45, 60, 60, false, 30);
        // Deep work = 45/90 = 0.5 -> 0.5 * 0.35 = 0.175
        // Follow through = 60/(60+60) = 0.5 -> 0.5 * 0.25 = 0.125
        // Workout = 0.0 -> 0.0
        // Intentionality = 30/60 = 0.5 -> 0.5 * 0.20 = 0.10
        // Total = 0.4
        assertEquals(0.4, score, 0.001);
    }

    @Test
    void testApplyDecay_NoDaysMissed() {
        LocalDate previous = LocalDate.now().minusDays(1);
        double momentum = calculator.applyDecay(0.8, previous, LocalDate.now());
        // daysMissed = 1. Loop doesn't execute because i starts at 1 and daysMissed is 1.
        assertEquals(0.8, momentum, 0.001);
    }

    @Test
    void testApplyDecay_OneDayMissed() {
        LocalDate previous = LocalDate.now().minusDays(2);
        double momentum = calculator.applyDecay(0.8, previous, LocalDate.now());
        // daysMissed = 2. Loop runs once for i=1.
        assertEquals(0.8 * 0.92, momentum, 0.001);
    }

    @Test
    void testApplyDecay_FloorEnforced() {
        LocalDate previous = LocalDate.now().minusDays(30);
        double momentum = calculator.applyDecay(0.8, previous, LocalDate.now());
        assertEquals(MomentumCalculator.FLOOR, momentum, 0.001);
    }

    @Test
    void testDetermineTrend_Stable() {
        MomentumTrend trend = calculator.determineTrend(0.5, List.of(0.49, 0.48));
        assertEquals(MomentumTrend.STABLE, trend);
    }

    @Test
    void testDetermineTrend_Rising() {
        MomentumTrend trend = calculator.determineTrend(0.55, List.of(0.50, 0.49, 0.48));
        // delta = 0.55 - 0.48 = 0.07 > 0.03
        assertEquals(MomentumTrend.RISING, trend);
    }

    @Test
    void testDetermineTrend_Falling() {
        MomentumTrend trend = calculator.determineTrend(0.40, List.of(0.45, 0.46, 0.47));
        // delta = 0.40 - 0.47 = -0.07 < -0.03
        assertEquals(MomentumTrend.FALLING, trend);
    }

    @Test
    void testDetermineState() {
        assertEquals(MomentumState.DORMANT, calculator.determineState(0.15, MomentumTrend.STABLE, false));
        assertEquals(MomentumState.RECOVERING, calculator.determineState(0.35, MomentumTrend.RISING, true));
        assertEquals(MomentumState.COOLING, calculator.determineState(0.50, MomentumTrend.FALLING, false));
        assertEquals(MomentumState.BUILDING, calculator.determineState(0.45, MomentumTrend.STABLE, false));
        assertEquals(MomentumState.STEADY, calculator.determineState(0.60, MomentumTrend.STABLE, false));
        assertEquals(MomentumState.STRONG, calculator.determineState(0.75, MomentumTrend.STABLE, false));
        assertEquals(MomentumState.LOCKED_IN, calculator.determineState(0.85, MomentumTrend.STABLE, false));
    }

    @Test
    void testCalculateRhythmPosition_IsClamped() {
        assertEquals(0.0, calculator.calculateRhythmPosition(MomentumState.BUILDING, 0.21), 0.001);
        assertEquals(1.0, calculator.calculateRhythmPosition(MomentumState.LOCKED_IN, 1.1), 0.001);
    }
}
