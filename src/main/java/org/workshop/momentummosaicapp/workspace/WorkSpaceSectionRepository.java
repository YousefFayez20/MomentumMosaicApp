package org.workshop.momentummosaicapp.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkSpaceSectionRepository extends JpaRepository<WorkspaceSection,Long> {
    List<WorkspaceSection> findByAppUserIdOrderByOrderIndex(Long userId);
    Boolean existsByAppUserIdAndName(Long userId, String name);
}
