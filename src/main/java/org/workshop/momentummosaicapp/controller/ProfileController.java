package org.workshop.momentummosaicapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.user.dto.CompleteProfileRequest;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final AppUserRepository appUserRepository;

    @PostMapping("/complete")
    public void completeProfile(
            @Valid @RequestBody CompleteProfileRequest request,
            Authentication authentication
    ) {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow();

        user.setGender(request.gender());
        user.setHeightCm(request.heightCm());
        user.setWeightKg(request.weightKg());
        user.setProfileCompleted(true);

        appUserRepository.save(user);
    }

}
