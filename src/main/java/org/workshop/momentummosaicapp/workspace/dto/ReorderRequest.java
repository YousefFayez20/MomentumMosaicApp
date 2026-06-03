package org.workshop.momentummosaicapp.workspace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReorderRequest {
    @NotNull
    private Long entryId;
    @NotNull private Integer orderIndex;
}