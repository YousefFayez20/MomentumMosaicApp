package org.workshop.momentummosaicapp.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.workspace.WorkspaceResourceType;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateResourceRequest {
    @NotBlank
    @Size(max = 500)
    private String url;
    @Size(max = 200)
    private String label;
    private WorkspaceResourceType resourceType;
}