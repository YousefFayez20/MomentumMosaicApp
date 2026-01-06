package org.workshop.momentummosaicapp.fitness;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Testcontainers
class DailyFitnessLogRepositoryTest {
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
    DailyFitnessLogRepository dailyFitnessLogRepository;

    @Autowired
    AppUserRepository appUserRepository;

    @Test
    void findByAppUserIdAndDate() {
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        user.setEnabled(true);
        appUserRepository.save(user);

        DailyFitnessLog dailyFitnessLog = new DailyFitnessLog();
        dailyFitnessLog.setAppUser(user);
        dailyFitnessLog.setDidWorkout(false);
        dailyFitnessLog.setDate(LocalDate.now());

        dailyFitnessLogRepository.save(dailyFitnessLog);

        Optional<DailyFitnessLog> result = dailyFitnessLogRepository.findByAppUserIdAndDate(user.getId(), dailyFitnessLog.getDate());

        assertTrue(result.isPresent());
        assertEquals(dailyFitnessLog.getDate(),result.get().getDate());



    }
}