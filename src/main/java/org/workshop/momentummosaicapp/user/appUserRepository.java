package org.workshop.momentummosaicapp.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface appUserRepository extends JpaRepository<AppUser,Long> {
    Optional<AppUser> findByEmail(String email);

}
