package org.workshop.momentummosaicapp.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import org.workshop.momentummosaicapp.user.AppUserRepository;

@Component
public class ProfileGuard {

    public boolean isCompleted(Authentication authentication) {

        if (authentication == null) return false;

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof AppUserPrincipal user)) {
            return false;
        }

        return user.isProfileCompleted();
    }
}
