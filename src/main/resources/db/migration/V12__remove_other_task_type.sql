UPDATE task
SET task_type = 'SHALLOW'
WHERE task_type = 'OTHER';

ALTER TABLE task
    MODIFY COLUMN task_type ENUM(
    'DEEP',
    'SHALLOW',
    'FITNESS'
    ) NOT NULL;