package org.workshop.momentummosaicapp.workspace.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkspaceRequest {
    @Size(max = 200)
    private String title;        // null = don't update
    private Long sectionId;      // null = don't update
    private boolean clearSection; // true = remove section (uncategorize)
    private Boolean archived;    // null = don't update
}
