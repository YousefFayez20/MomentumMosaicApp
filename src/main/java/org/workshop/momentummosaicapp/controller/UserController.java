package org.workshop.momentummosaicapp.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.user.User;
import org.workshop.momentummosaicapp.user.UserService;
import org.workshop.momentummosaicapp.user.dto.CreateUserRequest;
import org.workshop.momentummosaicapp.user.dto.UpdateUserRequest;
import org.workshop.momentummosaicapp.user.dto.UserResponse;
import org.workshop.momentummosaicapp.utility.DtoMapper;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final DtoMapper dtoMapper;

    @PostMapping("/create")
    public UserResponse createUser(@RequestBody @Valid CreateUserRequest request){

      User user =  userService.createUser(request.getName(),request.getGender(), request.getHeightCm(), request.getWeightKg());
        return dtoMapper.userToUserResponse(user);
    }
    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable Long userId){
        User user = userService.getUser(userId);
        return dtoMapper.userToUserResponse(user);
    }
    @PutMapping("/{userId}")
    public UserResponse updateUser(@PathVariable Long userId, @RequestBody @Valid UpdateUserRequest request){
         User user = userService.updateUser(userId, request.getHeightCm(), request.getWeightKg());
        return dtoMapper.userToUserResponse(user);
    }
}
