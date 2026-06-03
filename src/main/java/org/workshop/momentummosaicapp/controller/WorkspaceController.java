package org.workshop.momentummosaicapp.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import org.workshop.momentummosaicapp.utility.exception.UnauthorizedException;
import org.workshop.momentummosaicapp.workspace.WorkspaceService;
import org.workshop.momentummosaicapp.workspace.dto.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class WorkspaceController {
    private final WorkspaceService workspaceService;
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse createWorkspace(
           @RequestBody @Valid CreateWorkspaceRequest createWorkspaceRequest,
            Authentication auth
    ){
        return workspaceService.createWorkspace(extractUserId(auth),createWorkspaceRequest);
    }
    @GetMapping
    public List<WorkspaceSummaryResponse> listWorkspaces(Authentication auth){
        return workspaceService.listWorkspaces(extractUserId(auth));
    }
    @GetMapping("/recent")
    public List<WorkspaceSummaryResponse> getRecentWorkspaces(Authentication auth){
        return workspaceService.getRecentWorkspaces(extractUserId(auth));
    }
    @GetMapping("/{workspaceId}")
    public WorkspaceResponse getWorkspace(Authentication authentication,
                                          @PathVariable Long workspaceId){
        return workspaceService.getWorkspace(extractUserId(authentication),workspaceId);
    }
    @PutMapping("/{workspaceId}")
    public WorkspaceResponse updateWorkspace(@PathVariable Long workspaceId,
                                             @RequestBody @Valid UpdateWorkspaceRequest request,
                                             Authentication authentication){
        return workspaceService.updateWorkspace(extractUserId(authentication),workspaceId,request);
    }

    @DeleteMapping("/{workspaceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkspace(Authentication auth, @PathVariable Long workspaceId){
         workspaceService.deleteWorkspace(extractUserId(auth),workspaceId);
    }
    // ---- Sections ----
    @PostMapping("/sections")
    @ResponseStatus(HttpStatus.CREATED)
    public SectionResponse createSection(
            Authentication auth,
            @RequestBody @Valid CreateSectionRequest req) {
        return workspaceService.createSection(extractUserId(auth), req);
    }
    @GetMapping("/sections")
    public List<SectionResponse> listSections(Authentication auth) {
        return workspaceService.listSections(extractUserId(auth));
    }
    @PutMapping("/sections/{sectionId}")
    public SectionResponse updateSection(
            Authentication auth,
            @PathVariable Long sectionId,
            @RequestBody @Valid CreateSectionRequest req) {
        return workspaceService.updateSection(extractUserId(auth), sectionId, req);
    }
    @DeleteMapping("/sections/{sectionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSection(Authentication auth, @PathVariable Long sectionId) {
        workspaceService.deleteSection(extractUserId(auth), sectionId);
    }
    // ---- Entries ----
    @PostMapping("/{workspaceId}/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public EntryResponse createEntry(
            Authentication auth,
            @PathVariable Long workspaceId,
            @RequestBody @Valid CreateEntryRequest req) {
        return workspaceService.createEntry(extractUserId(auth), workspaceId, req);
    }
    @PutMapping("/{workspaceId}/entries/{entryId}")
    public EntryResponse updateEntry(
            Authentication auth,
            @PathVariable Long workspaceId,
            @PathVariable Long entryId,
            @RequestBody UpdateEntryRequest req) { // No @Valid — all fields optional for autosave
        return workspaceService.updateEntry(extractUserId(auth), workspaceId, entryId, req);
    }
    @DeleteMapping("/{workspaceId}/entries/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(
            Authentication auth,
            @PathVariable Long workspaceId,
            @PathVariable Long entryId) {
        workspaceService.deleteEntry(extractUserId(auth), workspaceId, entryId);
    }
    @PutMapping("/{workspaceId}/entries/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderEntries(
            Authentication auth,
            @PathVariable Long workspaceId,
            @RequestBody List<ReorderRequest> reorderList) {
        workspaceService.reorderEntries(extractUserId(auth), workspaceId, reorderList);
    }
    // ---- Resources ----
    @PostMapping("/{workspaceId}/resources")
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceResponse addResource(
            Authentication auth,
            @PathVariable Long workspaceId,
            @RequestBody @Valid CreateResourceRequest req) {
        return workspaceService.addResource(extractUserId(auth), workspaceId, req);
    }
    @DeleteMapping("/{workspaceId}/resources/{resourceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResource(
            Authentication auth,
            @PathVariable Long workspaceId,
            @PathVariable Long resourceId) {
        workspaceService.deleteResource(extractUserId(auth), workspaceId, resourceId);
    }
    // ---- Focus Summary ----
    @GetMapping("/{workspaceId}/focus-summary")
    public FocusSummaryResponse getFocusSummary(
            Authentication auth,
            @PathVariable Long workspaceId) {
        return workspaceService.getFocusSummary(extractUserId(auth), workspaceId);
    }


    private Long extractUserId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrincipal)) {
            throw new UnauthorizedException("User not authenticated");
        }
        return ((AppUserPrincipal) auth.getPrincipal()).getUserId();
    }
}
