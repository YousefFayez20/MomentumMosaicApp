package org.workshop.momentummosaicapp.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
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
