package org.workshop.momentummosaicapp.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceResourceRepository extends JpaRepository<WorkspaceResource, Long> {
    List<WorkspaceResource> findByWorkspaceIdOrderByOrderIndex(Long workspaceId);
}