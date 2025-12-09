package org.workshop.momentummosaicapp.utility;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private Instant timestamp;
    private int status;
    private String error;     // Short, static label (ex: "Bad Request")
    private String message;   // Detailed message from code or validation
    private String path;
}
