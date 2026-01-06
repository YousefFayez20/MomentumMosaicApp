package org.workshop.momentummosaicapp.task;

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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Testcontainers
class TaskRepositoryTest {
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
    TaskRepository taskRepository;

    @Autowired
    AppUserRepository appUserRepository;

    @Test
    void findByAppUserIdAndCompletedFalse() {
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        user.setEnabled(true);
        appUserRepository.save(user);
        Task task = new Task();
        task.setAppUser(user);
        task.setTitle("GYM");
        task.setTaskType(TaskType.FITNESS);
        task.setDurationMinutes(60);
        task.setCompleted(false);
        taskRepository.save(task);



        Task completedTask = new Task();
        completedTask.setAppUser(user);
        completedTask.setCompleted(true);
        completedTask.setTitle("Cardio");
        completedTask.setTaskType(TaskType.FITNESS);
        completedTask.setDurationMinutes(60);
        taskRepository.save(completedTask);

        List<Task> tasks = taskRepository.findByAppUserIdAndCompletedFalse(user.getId());

        assertEquals(1,tasks.size());
        assertFalse(tasks.get(0).isCompleted());



    }
}