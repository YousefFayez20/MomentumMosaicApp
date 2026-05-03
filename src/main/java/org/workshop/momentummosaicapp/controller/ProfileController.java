package org.workshop.momentummosaicapp.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.user.*;
import org.workshop.momentummosaicapp.user.dto.CompleteProfileRequest;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AppUserService appUserService;
    @PutMapping("/complete")
    public void completeProfile(
            @Valid @RequestBody CompleteProfileRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        appUserService.completeProfile(authentication,httpRequest,request);
    }
}

