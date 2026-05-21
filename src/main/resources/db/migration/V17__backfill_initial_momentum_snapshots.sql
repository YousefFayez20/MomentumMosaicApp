INSERT INTO momentum_snapshot (
    user_id,
    date,
    daily_rhythm_score,
    rolling_momentum,
    momentum_state,
    trend
)
SELECT
    u.id,
    CURRENT_DATE,
    0.5,
    0.5,
    'BUILDING',
    'STABLE'
FROM app_user u
WHERE NOT EXISTS (
    SELECT 1
    FROM momentum_snapshot ms
    WHERE ms.user_id = u.id
      AND ms.date = CURRENT_DATE
);
