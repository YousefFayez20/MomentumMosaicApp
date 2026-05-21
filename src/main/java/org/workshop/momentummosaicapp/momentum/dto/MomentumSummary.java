package org.workshop.momentummosaicapp.momentum.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomentumSummary {
    private String state;
    private String displayLabel;
    private String trend;
    private double rhythmPosition;
    private String contextMessage;
}
