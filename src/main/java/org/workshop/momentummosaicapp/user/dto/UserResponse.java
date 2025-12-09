package org.workshop.momentummosaicapp.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.workshop.momentummosaicapp.user.Gender;



@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private Gender gender;
    private Integer heightCm;
    private Integer weightKg;
}
