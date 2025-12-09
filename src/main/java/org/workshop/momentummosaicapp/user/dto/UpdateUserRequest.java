package org.workshop.momentummosaicapp.user.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Positive(message = "Height must be positive")
    private Integer heightCm;

    @Positive(message = "Weight must be positive")
    private Integer weightKg;
}
