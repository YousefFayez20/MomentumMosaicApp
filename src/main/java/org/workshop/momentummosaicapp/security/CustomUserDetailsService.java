package org.workshop.momentummosaicapp.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.appUserRepository;

@RequiredArgsConstructor
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final appUserRepository appUserRepository;


    @Override
    public UserDetails loadUserByUsername(String email)  {
        AppUser appUser =  appUserRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException("User don't exist: "));



        return User.builder().username(appUser.getEmail()).disabled(!appUser.isEnabled())
                .roles(appUser.getRole().name()).password(appUser.getPasswordHash())
                .build()
                ;
    }
}

