package org.workshop.momentummosaicapp.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.user.Gender;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private Gender gender;
    @Positive(message = "Height must be positive")
    private Integer heightCm;

    @Positive(message = "Weight must be positive")
    private Integer weightKg;
}
