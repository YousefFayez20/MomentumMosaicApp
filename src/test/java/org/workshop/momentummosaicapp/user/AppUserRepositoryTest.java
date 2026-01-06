package org.workshop.momentummosaicapp.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;


@DataJpaTest
@Testcontainers
class AppUserRepositoryTest {
    @Container
    static MySQLContainer<?> mysql =
            new MySQLContainer<>("mysql:8.4")
                    .withDatabaseName("testdb")
                    .withUsername("test")
                    .withPassword("test");
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    AppUserRepository appUserRepository;

    @Test
    void shouldFindUserByEmail(){
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        user.setEnabled(true);

        appUserRepository.save(user);
        Optional<AppUser> result =
                appUserRepository.findByEmail("test@example.com");
        assertTrue(result.isPresent());
        assertTrue(appUserRepository.findByEmail("missing@mail.com").isEmpty());
        assertEquals("test@example.com",result.get().getEmail());

    }



}