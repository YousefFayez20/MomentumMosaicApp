package org.workshop.momentummosaicapp.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {
    @GetMapping("/success")
    public Map<String,Object> loginSuccess(Authentication authentication)
    {
        OAuth2User oAuthUser  = (OAuth2User) authentication.getPrincipal();
        return Map.of("email",oAuthUser.getAttribute("email")
        ,
                "name",oAuthUser.getAttribute("name"));
    }
}
