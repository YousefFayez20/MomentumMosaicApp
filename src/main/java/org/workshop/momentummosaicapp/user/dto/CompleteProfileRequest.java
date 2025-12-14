package org.workshop.momentummosaicapp.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.workshop.momentummosaicapp.user.Gender;

public record CompleteProfileRequest (
        @NotNull Gender gender,
        @NotNull @Min(50) Integer heightCm,
        @NotNull @Min(20) Integer weightKg)
{}
