package org.workshop.momentummosaicapp.user;

public interface appUserService {
    public AppUser createUser(String name, Gender gender, Integer heightCm, Integer weightKg);
    public AppUser getUser(Long userId);
    public AppUser updateUser(Long userId, Integer heightCm, Integer weightKg);
    public AppUser getByEmail(String email);

}
