package org.workshop.momentummosaicapp.workspace;

import org.workshop.momentummosaicapp.workspace.dto.*;

import java.util.List;

public interface WorkspaceService {
    // ---- Workspace CRUD ----
    WorkspaceResponse createWorkspace(Long userId, CreateWorkspaceRequest req);
    List<WorkspaceSummaryResponse> listWorkspaces(Long userId);
    List<WorkspaceSummaryResponse> getRecentWorkspaces(Long userId);
    WorkspaceResponse getWorkspace(Long userId, Long workspaceId);
    WorkspaceResponse updateWorkspace(Long userId, Long workspaceId, UpdateWorkspaceRequest req);
    void deleteWorkspace(Long userId, Long workspaceId);
    // ---- Section CRUD ----
    SectionResponse createSection(Long userId, CreateSectionRequest req);
    List<SectionResponse> listSections(Long userId);
    SectionResponse updateSection(Long userId, Long sectionId, CreateSectionRequest req);
    void deleteSection(Long userId, Long sectionId);
    // ---- Entry Operations ----
    EntryResponse createEntry(Long userId, Long workspaceId, CreateEntryRequest req);
    EntryResponse updateEntry(Long userId, Long workspaceId, Long entryId, UpdateEntryRequest req);
    void deleteEntry(Long userId, Long workspaceId, Long entryId);
    void reorderEntries(Long userId, Long workspaceId, List<ReorderRequest> reorderList);
    // ---- Resource Operations ----
    ResourceResponse addResource(Long userId, Long workspaceId, CreateResourceRequest req);
    void deleteResource(Long userId, Long workspaceId, Long resourceId);
    // ---- Focus Integration ----
    FocusSummaryResponse getFocusSummary(Long userId, Long workspaceId);

}
