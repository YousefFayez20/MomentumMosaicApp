package org.workshop.momentummosaicapp.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class ProfileGuard {

    public boolean isCompleted(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CurrentUser currentUser)) {
            return false;
        }
        return currentUser.isProfileCompleted();
    }
}
