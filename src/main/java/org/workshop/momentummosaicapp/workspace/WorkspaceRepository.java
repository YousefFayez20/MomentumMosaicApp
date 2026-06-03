package org.workshop.momentummosaicapp.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace,Long> {
    List<Workspace> findByAppUserIdAndArchivedFalseOrderByOrderIndex(Long appUserId);
    // Continuity query — "pick up where you left off"
    // Uses the composite index (user_id, last_active_at)
    List<Workspace> findTop10ByAppUserIdAndArchivedFalseOrderByLastActiveAtDesc(Long userId);

}
