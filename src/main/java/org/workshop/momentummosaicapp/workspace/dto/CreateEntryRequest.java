package org.workshop.momentummosaicapp.workspace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.workspace.WorkspaceEntryType;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateEntryRequest {
    @NotNull(message = "Entry type is required")
    private WorkspaceEntryType entryType;
    private String content;      // plain text, optional on creation
    private Long parentEntryId;  // null = root-level
}
