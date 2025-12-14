package org.workshop.momentummosaicapp.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.appUserService;
import org.workshop.momentummosaicapp.user.dto.CreateUserRequest;
import org.workshop.momentummosaicapp.user.dto.UpdateUserRequest;
import org.workshop.momentummosaicapp.user.dto.UserResponse;
import org.workshop.momentummosaicapp.utility.DtoMapper;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("@profileGuard.isCompleted(authentication)")
public class UserController {

    private final appUserService appUserService;
    private final DtoMapper dtoMapper;

    @PostMapping("/create")
    public UserResponse createUser(@RequestBody @Valid CreateUserRequest request){

      AppUser appUser =  appUserService.createUser(request.getName(),request.getGender(), request.getHeightCm(), request.getWeightKg());
        return dtoMapper.userToUserResponse(appUser);
    }
    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable Long userId){
        AppUser appUser = appUserService.getUser(userId);
        return dtoMapper.userToUserResponse(appUser);
    }
    @PutMapping("/{userId}")
    public UserResponse updateUser(@PathVariable Long userId, @RequestBody @Valid UpdateUserRequest request){
         AppUser appUser = appUserService.updateUser(userId, request.getHeightCm(), request.getWeightKg());
        return dtoMapper.userToUserResponse(appUser);
    }
}
