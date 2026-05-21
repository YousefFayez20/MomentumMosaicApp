package org.workshop.momentummosaicapp.momentum;

import org.workshop.momentummosaicapp.momentum.dto.MomentumSummary;

public interface MomentumService {
    public MomentumSummary computeForUser(Long userId);
}
