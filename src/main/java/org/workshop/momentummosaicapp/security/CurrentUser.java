package org.workshop.momentummosaicapp.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.workshop.momentummosaicapp.user.AppUser;

import java.util.List;

public class CurrentUser extends org.springframework.security.core.userdetails.User {

    private final boolean profileCompleted;

    public CurrentUser(AppUser user) {
        super(
                user.getEmail(),
                user.getPasswordHash() == null ? "" : user.getPasswordHash(),
                user.isEnabled(),
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        this.profileCompleted = user.isProfileCompleted();
    }

    public boolean isProfileCompleted() {
        return profileCompleted;
    }
}
