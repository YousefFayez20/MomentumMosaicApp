-- ============================================================
-- WorkspaceSection: lightweight user-defined groupings
-- e.g. "DSA", "System Design", "Backend"
-- Workspaces may belong to a section OR be uncategorized (NULL).
-- ============================================================
CREATE TABLE workspace_section (
                                   id          BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   user_id     BIGINT      NOT NULL,
                                   name        VARCHAR(100) NOT NULL,
                                   order_index INT          NULL,
                                   created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_section_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
                                   CONSTRAINT uq_section_user_name UNIQUE (user_id, name)
);
-- ============================================================
-- Workspace: the core persistent execution context
-- One user owns many workspaces.
-- section_id is nullable — uncategorized workspaces are first-class.
-- last_active_at is the primary continuity signal.
-- ============================================================
CREATE TABLE workspace (
                           id             BIGINT AUTO_INCREMENT PRIMARY KEY,
                           user_id        BIGINT       NOT NULL,
                           section_id     BIGINT       NULL,
                           title          VARCHAR(200) NOT NULL,
                           order_index    INT          NULL,
                           archived       BOOLEAN      NOT NULL DEFAULT FALSE,
                           last_active_at TIMESTAMP    NULL,
                           created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           CONSTRAINT fk_workspace_user    FOREIGN KEY (user_id)    REFERENCES app_user(id)        ON DELETE CASCADE,
                           CONSTRAINT fk_workspace_section FOREIGN KEY (section_id) REFERENCES workspace_section(id) ON DELETE SET NULL
);

-- Composite index for the "recently active" continuity query
-- Query: WHERE user_id = ? AND archived = false ORDER BY last_active_at DESC
CREATE INDEX idx_ws_user_active ON workspace (user_id, last_active_at);
CREATE INDEX idx_ws_section ON workspace (section_id);
-- ============================================================
-- WorkspaceEntry: the recursive writing unit (adjacency list)
-- Only BULLET and TOGGLE types — plain text content.
-- parent_entry_id = NULL means root-level entry.
-- Max enforced depth: 3 (enforced in service layer, not DB).
-- ON DELETE CASCADE: deleting a workspace wipes all entries.
-- ============================================================
CREATE TABLE workspace_entry (
                                 id              BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 workspace_id    BIGINT      NOT NULL,
                                 parent_entry_id BIGINT      NULL,
                                 entry_type      VARCHAR(20) NOT NULL,   -- 'BULLET' or 'TOGGLE'
                                 content         TEXT        NULL,       -- plain text, no markdown
                                 collapsed       BOOLEAN     NOT NULL DEFAULT FALSE,
                                 order_index     INT         NOT NULL,
                                 created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_entry_workspace FOREIGN KEY (workspace_id)    REFERENCES workspace(id)       ON DELETE CASCADE,
                                 CONSTRAINT fk_entry_parent    FOREIGN KEY (parent_entry_id) REFERENCES workspace_entry(id) ON DELETE CASCADE
);
-- Retrieval: flat load ordered by order_index for Java-side tree assembly
CREATE INDEX idx_entry_workspace ON workspace_entry (workspace_id, order_index);
-- Parent lookup for cascade/child operations
CREATE INDEX idx_entry_parent ON workspace_entry (parent_entry_id);
-- ============================================================
-- WorkspaceResource: contextual links and references
-- Secondary to entries. URL references only — no file uploads.
-- ON DELETE CASCADE: deleting workspace wipes resources.
-- ============================================================
CREATE TABLE workspace_resource (
                                    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    workspace_id  BIGINT       NOT NULL,
                                    url           VARCHAR(500) NOT NULL,
                                    label         VARCHAR(200) NULL,        -- optional display name
                                    resource_type VARCHAR(20)  NULL,        -- LINK, VIDEO, PDF, DOC, OTHER
                                    order_index   INT          NULL,
                                    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT fk_resource_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE
);
CREATE INDEX idx_resource_workspace ON workspace_resource (workspace_id);