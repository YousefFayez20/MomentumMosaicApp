package org.workshop.momentummosaicapp.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.workspace.WorkspaceEntryType;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEntryRequest {
    private String content;              // null = don't update
    private Boolean collapsed;           // null = don't update
    private WorkspaceEntryType entryType; // null = don't update
}