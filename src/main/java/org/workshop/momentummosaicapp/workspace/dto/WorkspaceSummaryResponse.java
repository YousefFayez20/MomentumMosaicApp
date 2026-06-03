package org.workshop.momentummosaicapp.workspace.dto;

import lombok.*;

import java.time.Instant;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceSummaryResponse {
    private Long id;
    private String title;
    private Long sectionId;
    private String sectionName;
    private Instant lastActiveAt;
    private Instant createdAt;
}
