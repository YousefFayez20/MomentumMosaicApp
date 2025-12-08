package org.workshop.momentummosaicapp.user;

public interface UserService {
    public User createUser(String name,Gender gender,Integer heightCm,Integer weightKg);
    public User getUser(Long userId);
    public User updateUser(Long userId,Integer heightCm,Integer weightKg);


}
