-- Add optional workspace linkage to existing tasks.
-- A task MAY belong to one workspace (execution context).
-- ON DELETE SET NULL: deleting a workspace does NOT delete tasks.
-- Tasks represent execution history — they must persist independently.
ALTER TABLE task
    ADD COLUMN workspace_id BIGINT NULL,
    ADD CONSTRAINT fk_task_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE SET NULL;
CREATE INDEX idx_task_workspace ON task (workspace_id);