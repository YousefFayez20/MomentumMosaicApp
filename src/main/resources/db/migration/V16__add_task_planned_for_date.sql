ALTER TABLE task
    ADD COLUMN planned_for_date DATE NULL;

CREATE INDEX idx_task_user_planned_date_status
    ON task(user_id, planned_for_date, status);

UPDATE task
SET planned_for_date = DATE(created_at)
WHERE planned_for_date IS NULL;

UPDATE task
SET planned_for_date = CURRENT_DATE
WHERE planned_for_date IS NULL;
