CREATE TABLE momentum_snapshot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    daily_rhythm_score DOUBLE NOT NULL,
    rolling_momentum DOUBLE NOT NULL,
    momentum_state VARCHAR(50) NOT NULL,
    trend VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_momentum_snapshot_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT uq_user_date UNIQUE (user_id, date)
);
