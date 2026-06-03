package org.workshop.momentummosaicapp.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.workshop.momentummosaicapp.task.TaskRepository;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ConflictException;
import org.workshop.momentummosaicapp.utility.exception.ForbiddenException;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;
import org.workshop.momentummosaicapp.workspace.dto.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceServiceImpl implements WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkSpaceSectionRepository workSpaceSectionRepository;
    private final AppUserRepository appUserRepository;
    private final WorkSpaceEntryRepository workSpaceEntryRepository;
    private final WorkspaceResourceRepository workspaceResourceRepository;
    private final TaskRepository taskRepository;
    private static final int MAX_ENTRY_DEPTH = 3;
    private static final int ORDER_GAP = 1000; // Gap-based ordering


    @Override
    public WorkspaceResponse createWorkspace(Long userId, CreateWorkspaceRequest req) {
      WorkspaceSection section =null;
        AppUser appUser = getUserOrThrow(userId);
      if(req.getSectionId() != null){
          section = getSectionOrThrow(req.getSectionId());
          validateSectionOwnership(userId,section);
      }
      Workspace workspace = new Workspace();
      workspace.setLastActiveAt(Instant.now());
      workspace.setAppUser(appUser);
      workspace.setSection(section);
      workspace.setTitle(req.getTitle().trim());
      workspaceRepository.save(workspace);

        return toWorkspaceResponse(workspace,List.of(),List.of());
    }

    @Override
    public List<WorkspaceSummaryResponse> listWorkspaces(Long userId) {
        return workspaceRepository.findByAppUserIdAndArchivedFalseOrderByOrderIndex(userId).stream()
                .map(this::toWorkspaceSummaryResponse).toList();
    }

    @Override
    public List<WorkspaceSummaryResponse> getRecentWorkspaces(Long userId) {
        return workspaceRepository.findTop10ByAppUserIdAndArchivedFalseOrderByLastActiveAtDesc(userId)
                .stream()
                .map(this::toWorkspaceSummaryResponse)
                .toList();
    }

    @Override
    public WorkspaceResponse getWorkspace(Long userId, Long workspaceId) {
       Workspace workspace = getWorkspaceOrThrow(workspaceId) ;
       validateWorkspaceOwnership(userId,workspace);
       touchWorkspace(workspace);
       List<WorkspaceEntry> workspaceEntries = workSpaceEntryRepository.findByWorkspaceIdOrderByOrderIndex(workspaceId);
       List<WorkspaceResource> workspaceResources = workspaceResourceRepository.findByWorkspaceIdOrderByOrderIndex(workspaceId);
        // Assemble flat list into a tree in memory
        List<EntryResponse> entryTree = buildEntryTree(workspaceEntries);



        return toWorkspaceResponse(workspace,entryTree,workspaceResources.stream().map(this::toResourceResponse).toList());
    }

    @Override
    public WorkspaceResponse updateWorkspace(Long userId, Long workspaceId, UpdateWorkspaceRequest req) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId,workspace);

        if(req.getTitle() != null){
            workspace.setTitle(req.getTitle().trim());
        }
        if(req.getSectionId() != null){
            WorkspaceSection section = getSectionOrThrow(req.getSectionId());
            validateSectionOwnership(userId,section);
            workspace.setSection(section);
        }else if(req.isClearSection()){
            workspace.setSection(null);
        }
        if(req.getArchived() != null){
            workspace.setArchived(req.getArchived());
        }
        touchWorkspace(workspace);
        return toWorkspaceResponse(workspace,List.of(),List.of());
    }

    @Override
    public void deleteWorkspace(Long userId, Long workspaceId) {
        Workspace ws = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId,ws);
        workspaceRepository.delete(ws);

    }

    @Override
    public SectionResponse createSection(Long userId, CreateSectionRequest req) {
        SectionResponse sectionResponse = new SectionResponse();
        AppUser appUser = getUserOrThrow(userId);
        if(workSpaceSectionRepository.existsByAppUserIdAndName(userId,req.getName().trim())){
            throw new ConflictException("An already existing section with name" + req.getName().trim());
        }
        WorkspaceSection section = new WorkspaceSection();
        section.setOrderIndex(req.getOrderIndex());
        section.setAppUser(appUser);
        section.setName(req.getName().trim());
        workSpaceSectionRepository.save(section);

        return toSectionResponse(section);
    }

    @Override
    public List<SectionResponse> listSections(Long userId) {

        return workSpaceSectionRepository.findByAppUserIdOrderByOrderIndex(userId).stream()
                .map(entity -> toSectionResponse(entity)).toList();
    }

    @Override
    public SectionResponse updateSection(Long userId, Long sectionId, CreateSectionRequest req) {
        AppUser appUser = getUserOrThrow(userId);
        WorkspaceSection section = getSectionOrThrow(sectionId);
        validateSectionOwnership(userId, section);
        section.setName(req.getName());
        section.setOrderIndex(req.getOrderIndex());
        workSpaceSectionRepository.save(section);

        return toSectionResponse(section);
    }

    @Override
    public void deleteSection(Long userId, Long sectionId) {
        WorkspaceSection section = getSectionOrThrow(sectionId);
        validateSectionOwnership(userId,section);
        workSpaceSectionRepository.delete(section);
    }

    @Override
    public EntryResponse createEntry(Long userId, Long workspaceId, CreateEntryRequest req) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId,workspace);
        WorkspaceEntry parent = null;
        if(req.getParentEntryId() != null){
            parent = getEntryOrThrow(req.getParentEntryId());
            if(!parent.getWorkspace().getId().equals(workspaceId)){
                throw new BadRequestException("Parent entry does not belong to this workspace.");
            }
            if(!parent.getEntryType().equals(WorkspaceEntryType.TOGGLE)){
                throw new BadRequestException("Only TOGGLE entries can contain nested entries.");
            }
            validateDepth(parent,workspaceId);
        }
        WorkspaceEntry entry = new WorkspaceEntry();
        entry.setWorkspace(workspace);
        entry.setEntryType(req.getEntryType());
        entry.setParentEntry(parent);
        entry.setContent(req.getContent());
        entry.setOrderIndex(computeNextOrderIndex(workspaceId,parent!= null ? parent.getId() : null));
        touchWorkspace(workspace);
        workSpaceEntryRepository.save(entry);
        return toEntryResponse(entry);
    }

    @Override
    public EntryResponse updateEntry(Long userId, Long workspaceId, Long entryId, UpdateEntryRequest req) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId, workspace);
        WorkspaceEntry entry = getEntryOrThrow(entryId);
        if (!entry.getWorkspace().getId().equals(workspaceId)) {
            throw new ForbiddenException("Entry does not belong to this workspace.");
        }
        if(req.getCollapsed()!=null) entry.setCollapsed(req.getCollapsed());
        if(req.getContent() != null) entry.setContent(req.getContent());
        if (req.getEntryType() != null) {
            // If changing from TOGGLE to BULLET and it has children, reject
            if (req.getEntryType() == WorkspaceEntryType.BULLET) {
                boolean hasChildren = workSpaceEntryRepository
                        .countByWorkspaceIdAndParentEntryId(workspaceId, entryId) > 0;
                if (hasChildren) {
                    throw new BadRequestException(
                            "Cannot change a TOGGLE with children to BULLET. Remove children first.");
                }
            }
            entry.setEntryType(req.getEntryType());
        }
        touchWorkspace(workspace);
        return toEntryResponse(workSpaceEntryRepository.save(entry));
    }

    @Override
    public void deleteEntry(Long userId, Long workspaceId, Long entryId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId, workspace);
        WorkspaceEntry entry = getEntryOrThrow(entryId);
        if (!entry.getWorkspace().getId().equals(workspaceId)) {
            throw new ForbiddenException("Entry does not belong to this workspace.");
        }
        // Children are CASCADE deleted by the DB FK.
        // No need to manually find and delete children.
        workSpaceEntryRepository.delete(entry);
        touchWorkspace(workspace);
    }

    @Override
    public void reorderEntries(Long userId, Long workspaceId, List<ReorderRequest> reorderList) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId, workspace);
        for (ReorderRequest item : reorderList) {
            WorkspaceEntry entry = getEntryOrThrow(item.getEntryId());
            if (!entry.getWorkspace().getId().equals(workspaceId)) {
                throw new ForbiddenException("Entry does not belong to this workspace.");
            }
            entry.setOrderIndex(item.getOrderIndex());
            workSpaceEntryRepository.save(entry);
        }
        touchWorkspace(workspace);
    }

    @Override
    public ResourceResponse addResource(Long userId, Long workspaceId, CreateResourceRequest req) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId, workspace);
        WorkspaceResource resource = new WorkspaceResource();
        resource.setWorkspace(workspace);
        resource.setUrl(req.getUrl());
        resource.setLabel(req.getLabel());
        resource.setResourceType(req.getResourceType());
        resource.setOrderIndex(
                workspaceResourceRepository.findByWorkspaceIdOrderByOrderIndex(workspaceId).size() * ORDER_GAP
        );
        touchWorkspace(workspace);
        return toResourceResponse(workspaceResourceRepository.save(resource));
    }

    @Override
    public void deleteResource(Long userId, Long workspaceId, Long resourceId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId, workspace);
        WorkspaceResource resource = workspaceResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        if (!resource.getWorkspace().getId().equals(workspaceId)) {
            throw new ForbiddenException("Resource does not belong to this workspace.");
        }
        workspaceResourceRepository.delete(resource);
    }

    @Override
    public FocusSummaryResponse getFocusSummary(Long userId, Long workspaceId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceOwnership(userId, workspace);
        // Derived — no FocusSession entity needed.
        int totalMinutes = taskRepository.sumActualMinutesByWorkspaceId(workspaceId);
        return new FocusSummaryResponse(workspaceId, totalMinutes);
    }
    /**
     * Touches lastActiveAt on every write operation.
     * This is the core continuity signal — it drives the "recently active" query.
     */
    private void touchWorkspace(Workspace workspace){
        workspace.setLastActiveAt(Instant.now());
        workspaceRepository.save(workspace);
    }
    /**
     * Assembles a flat list of entries into a parent→children tree.
     * One DB query, tree built in O(n) in Java.
     *
     * How it works:
     * 1. Build a map of parentId → list of children.
     * 2. Root entries have parentId = null (keyed as 0L).
     * 3. Recursively attach children to each parent's response DTO.
     */
    private List<EntryResponse> buildEntryTree(List<WorkspaceEntry> flatList) {
        Map<Long, List<EntryResponse>> childrenMap = new HashMap<>();
        for (WorkspaceEntry entry : flatList) {
            Long parentKey = entry.getParentEntry() != null
                    ? entry.getParentEntry().getId()
                    : 0L;
            childrenMap.computeIfAbsent(parentKey, k -> new ArrayList<>())
                    .add(toEntryResponse(entry));
        }
        // Attach children recursively
        for (List<EntryResponse> children : childrenMap.values()) {
            for (EntryResponse child : children) {
                List<EntryResponse> grandchildren = childrenMap.get(child.getId());
                child.setChildren(grandchildren != null ? grandchildren : List.of());
            }
        }
        return childrenMap.getOrDefault(0L, List.of());
    }
    private EntryResponse toEntryResponse(WorkspaceEntry e) {
        return new EntryResponse(
                e.getId(),
                e.getParentEntry() != null ? e.getParentEntry().getId() : null,
                e.getEntryType(), e.getContent(), e.isCollapsed(),
                e.getOrderIndex(), e.getCreatedAt(), e.getUpdatedAt(),
                List.of() // children populated by buildEntryTree
        );
    }
    private WorkspaceSection getSectionOrThrow(Long id){
        return workSpaceSectionRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Section Not found"));
    }
    private Workspace getWorkspaceOrThrow(Long WorkspaceId){
        return workspaceRepository.findById(WorkspaceId).orElseThrow(()->new ResourceNotFoundException("Workspace Not Found"));
    }
    private void validateSectionOwnership(Long userId, WorkspaceSection section){
        if(!section.getAppUser().getId().equals( userId)){
            throw new ForbiddenException("You do not have permission to access this resource.");
        }
    }
    private void validateWorkspaceOwnership(Long userId, Workspace ws){
        if(!ws.getAppUser().getId().equals( userId)){
            throw new ForbiddenException("You do not have permission to access this resource.");
        }
    }
    private AppUser getUserOrThrow(Long userId){
        return appUserRepository.findById(userId).orElseThrow(()->new ResourceNotFoundException("User Not Found"));
    }
    private ResourceResponse toResourceResponse(WorkspaceResource r) {
        return new ResourceResponse(
                r.getId(), r.getUrl(), r.getLabel(),
                r.getResourceType(), r.getOrderIndex(), r.getCreatedAt()
        );
    }
    private WorkspaceResponse toWorkspaceResponse(Workspace ws,
                                                  List<EntryResponse> entries, List<ResourceResponse> resources){
        return new WorkspaceResponse(
                ws.getId(),
                ws.getTitle(),
                ws.getSection() != null ? ws.getSection().getId() : null,
                ws.getSection() != null ? ws.getSection().getName() : null,
                ws.isArchived(),
                ws.getLastActiveAt(),
                ws.getCreatedAt(),
                ws.getUpdatedAt(),entries,resources
        );
    }
    private WorkspaceSummaryResponse toWorkspaceSummaryResponse(Workspace ws) {
        return new WorkspaceSummaryResponse(
                ws.getId(), ws.getTitle(),
                ws.getSection() != null ? ws.getSection().getId() : null,
                ws.getSection() != null ? ws.getSection().getName() : null,
                ws.getLastActiveAt(), ws.getCreatedAt()
        );
    }
    private SectionResponse toSectionResponse(WorkspaceSection s) {
        return new SectionResponse(s.getId(), s.getName(), s.getOrderIndex(), s.getCreatedAt());
    }
    /**
     * Validates that adding a child to 'parent' would not exceed MAX_ENTRY_DEPTH.
     * Walks up the parent chain in memory (max 3 hops — cheap).
     */
    private void validateDepth(WorkspaceEntry directParent, Long workspaceId) {
        int depth = 1; // directParent is already depth 1
        WorkspaceEntry current = directParent;
        while (current.getParentEntry() != null) {
            depth++;
            if (depth >= MAX_ENTRY_DEPTH) {
                throw new BadRequestException(
                        "Maximum nesting depth of " + MAX_ENTRY_DEPTH + " exceeded.");
            }
            // Fetch the parent (LAZY, so this triggers a query only when needed)
            current = getEntryOrThrow(current.getParentEntry().getId());
        }
    }
    private WorkspaceEntry getEntryOrThrow(Long id) {
        return workSpaceEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found"));
    }
    /**
     * Gap-based order index for new entries.
     * New entry = (count of siblings) * ORDER_GAP.
     * This allows insertion between entries without rewriting all orderIndex values.
     */
    private int computeNextOrderIndex(Long workspaceId, Long parentEntryId) {
        int siblingCount = workSpaceEntryRepository
                .countByWorkspaceIdAndParentEntryId(workspaceId, parentEntryId);
        return (siblingCount + 1) * ORDER_GAP;
    }

}
