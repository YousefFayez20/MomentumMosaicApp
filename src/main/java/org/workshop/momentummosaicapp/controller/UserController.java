package org.workshop.momentummosaicapp.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
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
    @GetMapping()
    public UserResponse getUser(Authentication authentication){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        AppUser appUser = appUserService.getUser(userId);
        return dtoMapper.userToUserResponse(appUser);
    }
    @PutMapping("/{userId}")
    public UserResponse updateUser(Authentication authentication, @RequestBody @Valid UpdateUserRequest request){
        if(authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Long userId = ((AppUserPrincipal)authentication.getPrincipal()).getUserId();
        AppUser appUser = appUserService.updateUser(userId, request.getHeightCm(), request.getWeightKg());
        return dtoMapper.userToUserResponse(appUser);
    }


}
