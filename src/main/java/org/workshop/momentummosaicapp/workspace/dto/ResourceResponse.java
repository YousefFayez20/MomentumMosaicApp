package org.workshop.momentummosaicapp.workspace.dto;

import lombok.*;
import org.workshop.momentummosaicapp.workspace.WorkspaceResourceType;

import java.time.Instant;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResourceResponse {
    private Long id;
    private String url;
    private String label;
    private WorkspaceResourceType resourceType;
    private Integer orderIndex;
    private Instant createdAt;
}
