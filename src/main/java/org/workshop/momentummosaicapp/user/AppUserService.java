package org.workshop.momentummosaicapp.user;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.workshop.momentummosaicapp.user.dto.CompleteProfileRequest;

public interface AppUserService {
    public AppUser createUser(String name, Gender gender, Integer heightCm, Integer weightKg);
    public AppUser getUser(Long userId);
    public AppUser updateUser(Long userId, Integer heightCm, Integer weightKg);
    public AppUser getByEmail(String email);
    public void completeProfile(Authentication authentication, HttpServletRequest httpRequest, CompleteProfileRequest request);

}
