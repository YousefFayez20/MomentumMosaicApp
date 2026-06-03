package org.workshop.momentummosaicapp.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkspaceRequest {
    @NotBlank(message = "Title is required")
    @Size(max=200)
    private String title;
    private Long sectionId;
}

