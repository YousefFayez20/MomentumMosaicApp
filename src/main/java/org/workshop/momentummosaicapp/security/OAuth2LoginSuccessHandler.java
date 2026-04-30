package org.workshop.momentummosaicapp.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.workshop.momentummosaicapp.security.dto.AuthResponse;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.user.Role;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        AppUser user = appUserRepository.findByEmail(email)
                .orElseGet(() -> {
                    AppUser newUser = new AppUser();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProfileCompleted(false);
                    newUser.setEnabled(true);
                    return appUserRepository.save(newUser);
                });

        AppUserPrincipal principal =
                new AppUserPrincipal(user, oauthUser.getAttributes());

        String token = jwtService.generateToken(user);
        response.sendRedirect(frontendUrl + "/auth/callback?token=" + token);

    }
}

