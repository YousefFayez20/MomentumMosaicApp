package org.workshop.momentummosaicapp.momentum;

public enum MomentumState {
    DORMANT("Resting"),
    RECOVERING("Recovering Rhythm"),
    BUILDING("Building Momentum"),
    STEADY("Steady Rhythm"),
    STRONG("Strong Focus"),
    LOCKED_IN("Locked In"),
    COOLING("Cooling Down");

    private final String displayLabel;
    MomentumState(String displayLabel) {
        this.displayLabel = displayLabel;
    }
    public String getDisplayLabel() {
        return displayLabel;
    }
}
