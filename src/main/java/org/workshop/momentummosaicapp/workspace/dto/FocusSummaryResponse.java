package org.workshop.momentummosaicapp.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;

@Builder
@AllArgsConstructor
public class FocusSummaryResponse {
    private Long workspaceId;
    private int totalFocusMinutes; // derived from linked completed tasks
}