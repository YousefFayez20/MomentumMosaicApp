package org.workshop.momentummosaicapp.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.user.Role;
import org.workshop.momentummosaicapp.user.dto.CompleteProfileRequest;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AppUserRepository appUserRepository;
    @PutMapping("/complete")
    public void completeProfile(
            @Valid @RequestBody CompleteProfileRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        if (authentication == null ||
                !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        AppUser user = appUserRepository.findByEmail(principal.getEmail())
                .orElseThrow();

        user.setGender(request.gender());
        user.setHeightCm(request.heightCm());
        user.setWeightKg(request.weightKg());
        user.setProfileCompleted(true);

        appUserRepository.save(user);

        // ✅ Create updated principal
        AppUserPrincipal updatedPrincipal =
                new AppUserPrincipal(user, principal.getAttributes());

        Authentication newAuth =
                new UsernamePasswordAuthenticationToken(
                        updatedPrincipal,
                        authentication.getCredentials(),
                        updatedPrincipal.getAuthorities()
                );

        // ✅ Persist authentication into session
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(newAuth);
        SecurityContextHolder.setContext(context);

        httpRequest.getSession(true)
                .setAttribute(
                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        context
                );
    }


}

