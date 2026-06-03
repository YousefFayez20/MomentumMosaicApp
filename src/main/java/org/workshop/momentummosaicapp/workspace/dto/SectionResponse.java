package org.workshop.momentummosaicapp.workspace.dto;

import lombok.*;

import java.time.Instant;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SectionResponse {
    private Long id;
    private String name;
    private Integer orderIndex;
    private Instant createdAt;
}
