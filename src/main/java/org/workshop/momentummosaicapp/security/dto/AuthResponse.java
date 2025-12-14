package org.workshop.momentummosaicapp.security.dto;

public record AuthResponse(
        String token,
        boolean profileCompleted
) {}
