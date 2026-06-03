package org.workshop.momentummosaicapp.workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkSpaceEntryRepository extends JpaRepository<WorkspaceEntry,Long> {
    // Loads ALL entries for a workspace flat, ordered by orderIndex.
    // Tree assembly happens in Java. One query, not N.
    List<WorkspaceEntry> findByWorkspaceIdOrderByOrderIndex(Long workspaceId);
    // How many direct children does this parent have?
    // Used for gap-based orderIndex assignment on new entries.
    int countByWorkspaceIdAndParentEntryId(Long workspaceId, Long parentEntryId);
    @Modifying
    @Query("DELETE FROM WorkspaceEntry e where e.parentEntry.id = :parentId")
    void deleteByParentEntryId(@Param("parentId") Long parentId);

    // How deep is a given entry? Used for depth enforcement.
    // We walk up the parent chain in the service layer instead.
    List<WorkspaceEntry> findByWorkspaceId(Long workspaceId);
}
