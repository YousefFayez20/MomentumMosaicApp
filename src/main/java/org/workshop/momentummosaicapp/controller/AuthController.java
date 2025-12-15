package org.workshop.momentummosaicapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof AppUserPrincipal user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return Map.of(
                "email", user.getEmail(),
                "name", user.getAttributes().get("name"),
                "userId", user.getUserId(),
                "profileCompleted", user.isProfileCompleted()
        );
    }
}