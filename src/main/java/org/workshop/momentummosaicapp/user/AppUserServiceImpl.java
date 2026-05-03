package org.workshop.momentummosaicapp.user;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.user.dto.CompleteProfileRequest;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class AppUserServiceImpl implements AppUserService {

    private final AppUserRepository appUserRepository;

    @Override
    public AppUser createUser(String name, Gender gender, Integer heightCm, Integer weightKg) {
        if(heightCm <=0) throw new BadRequestException("Height must be Positive");
        if(weightKg <=0) throw new BadRequestException("weight must be Positive");
        if(gender == null){
            gender = Gender.MALE;
        }
        AppUser appUser = new AppUser();
        appUser.setGender(gender);
        appUser.setHeightCm(heightCm);
        appUser.setName(name);
        appUser.setWeightKg(weightKg);
        return appUserRepository.save(appUser);
    }

    @Override
    public AppUser getUser(Long userId) {
        return appUserRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }

    @Override
    public AppUser updateUser(Long userId, Integer heightCm, Integer weightKg) {
        AppUser appUser = getUser(userId);
        if(heightCm <=0) throw new BadRequestException("Height must be Positive");
        if(weightKg <=0) throw new BadRequestException("weight must be Positive");
        appUser.setWeightKg(weightKg);
        appUser.setHeightCm(heightCm);
        return appUserRepository.save(appUser);

    }
    @Override
    public AppUser getByEmail(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @Override
    public void completeProfile(Authentication authentication, HttpServletRequest httpRequest, CompleteProfileRequest request) {
        if (authentication == null ||
                !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String userEmail = principal.getEmail();
        AppUser user = appUserRepository.findByEmail(userEmail)
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
