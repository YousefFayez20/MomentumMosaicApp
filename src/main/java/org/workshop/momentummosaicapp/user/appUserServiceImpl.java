package org.workshop.momentummosaicapp.user;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class appUserServiceImpl implements appUserService {

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

}
