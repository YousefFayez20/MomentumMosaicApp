package org.workshop.momentummosaicapp.user;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class AppUserPrincipal implements OAuth2User, UserDetails {

    private final AppUser user;
    private final Map<String, Object> attributes;

    public AppUserPrincipal(AppUser user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    public Long getUserId() {
        return user.getId();
    }

    public boolean isProfileCompleted() {
        return user.isProfileCompleted();
    }

    public String getEmail() {
        return user.getEmail();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getName() {
        return user.getEmail();
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash() == null ? "" : user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    public String getDisplayName() {
        if (attributes != null && attributes.get("name") != null) {
            return (String) attributes.get("name");
        }
        return user.getName() != null ? user.getName() : user.getEmail();
    }
}

