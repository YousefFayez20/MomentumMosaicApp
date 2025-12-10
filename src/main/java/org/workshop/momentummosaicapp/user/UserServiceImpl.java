package org.workshop.momentummosaicapp.user;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.utility.exception.BadRequestException;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;

    @Override
    public User createUser(String name, Gender gender, Integer heightCm, Integer weightKg) {
        if(heightCm <=0) throw new BadRequestException("Height must be Positive");
        if(weightKg <=0) throw new BadRequestException("weight must be Positive");
        if(gender == null){
            gender = Gender.MALE;
        }
        User user = new User();
        user.setGender(gender);
        user.setHeightCm(heightCm);
        user.setName(name);
        user.setWeightKg(weightKg);
        return userRepository.save(user);
    }

    @Override
    public User getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }

    @Override
    public User updateUser(Long userId, Integer heightCm, Integer weightKg) {
        User user = getUser(userId);
        if(heightCm <=0) throw new BadRequestException("Height must be Positive");
        if(weightKg <=0) throw new BadRequestException("weight must be Positive");
        user.setWeightKg(weightKg);
        user.setHeightCm(heightCm);
        return userRepository.save(user);

    }
}
