package org.workshop.momentummosaicapp.workspace.dto;

import lombok.*;
import org.workshop.momentummosaicapp.workspace.WorkspaceEntryType;

import java.time.Instant;
import java.util.List;

// EntryResponse.java — recursive, children populated by tree assembly
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EntryResponse {
    private Long id;
    private Long parentEntryId;
    private WorkspaceEntryType entryType;
    private String content;
    private boolean collapsed;
    private Integer orderIndex;
    private Instant createdAt;
    private Instant updatedAt;
    private List<EntryResponse> children;    // populated in buildEntryTree()
}
