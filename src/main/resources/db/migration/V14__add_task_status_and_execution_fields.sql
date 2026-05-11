-- Add new columns
ALTER TABLE task
    ADD COLUMN status VARCHAR(20) DEFAULT 'PLANNED';

ALTER TABLE task
    ADD COLUMN started_at TIMESTAMP NULL;

ALTER TABLE task
    ADD COLUMN actual_minutes INT NULL;

-- Migrate existing data
UPDATE task
SET status = 'COMPLETED'
WHERE completed = true;

UPDATE task
SET status = 'PLANNED'
WHERE completed = false;

-- Add index for optimized queries
CREATE INDEX idx_task_user_status
    ON task(user_id, status);