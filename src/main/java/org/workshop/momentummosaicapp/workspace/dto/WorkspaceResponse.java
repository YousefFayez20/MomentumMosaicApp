package org.workshop.momentummosaicapp.workspace.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String title;
    private Long sectionId;
    private String sectionName;
    private boolean archived;
    private Instant lastActiveAt;
    private Instant createdAt;
    private Instant updatedAt;
    private List<EntryResponse> entries;      // assembled tree
    private List<ResourceResponse> resources;
}