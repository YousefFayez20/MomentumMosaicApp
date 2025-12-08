package org.workshop.momentummosaicapp.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.workshop.momentummosaicapp.user.CreateUserRequest;
import org.workshop.momentummosaicapp.user.UpdateUserRequest;
import org.workshop.momentummosaicapp.user.User;
import org.workshop.momentummosaicapp.user.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @PostMapping("/create")
    public User createUser(@RequestBody CreateUserRequest request){
        return null;
    }
    @GetMapping("/{userId}")
    public User getUser(@PathVariable Long userId){
        return null;
    }
    @PutMapping("/{userId}")
    public User updateUser(@PathVariable Long userId, @RequestBody UpdateUserRequest request){
        return null;
    }
}
