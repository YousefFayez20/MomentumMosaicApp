package org.workshop.momentummosaicapp.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.workshop.momentummosaicapp.security.JwtAuthenticationFilter;
import org.workshop.momentummosaicapp.security.ProfileCompletionFilter;
import org.workshop.momentummosaicapp.security.ProfileGuard;
import org.workshop.momentummosaicapp.task.Task;
import org.workshop.momentummosaicapp.task.TaskService;
import org.workshop.momentummosaicapp.task.TaskType;
import org.workshop.momentummosaicapp.task.dto.TaskResponse;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.Gender;
import org.workshop.momentummosaicapp.utility.DtoMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;
import java.util.List;
import java.util.Map;

@WebMvcTest(
        controllers = TaskController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ClientAutoConfiguration.class,
                OAuth2ClientWebSecurityAutoConfiguration.class
        },
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = JwtAuthenticationFilter.class
                ),
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = ProfileCompletionFilter.class
                )
        }
)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class TaskControllerTest {

    @Autowired
    MockMvc mockMvc;
    @MockitoBean
    TaskService taskService;
    @MockitoBean
    DtoMapper dtoMapper;

    @MockitoBean
    ProfileGuard profileGuard;

    @Test
    void createTask() throws Exception {
        when(profileGuard.isCompleted(any())).thenReturn(true);
        Long userId =1L;
        AppUser appUser = new AppUser();
        appUser.setEnabled(true);
        appUser.setId(userId);
        appUser.setWeightKg(80);
        appUser.setHeightCm(180);
        appUser.setGender(Gender.MALE);

        Task task = new Task();
        task.setId(1L);
        task.setTitle("Study");
        task.setAppUser(appUser);
        task.setDurationMinutes(60);
        task.setTaskType(TaskType.SHALLOW);
        task.setCompleted(false);


        TaskResponse response = new TaskResponse();
        response.setId(1L);
        response.setTitle("Study");
        response.setTaskType(TaskType.SHALLOW);
        response.setDurationMinutes(60);
        response.setCompleted(false);

        when(taskService.createTask(eq("Study"), eq(1L), eq(TaskType.SHALLOW), eq(60), isNull(), isNull()))
                .thenReturn(task);
        when(dtoMapper.taskToTaskResponse(task)).thenReturn(response);

        AppUserPrincipal principal = new AppUserPrincipal(appUser, Map.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(post("/api/tasks")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                        "title": "Study",
                        "taskType": "SHALLOW",
                        "durationMinutes": 60
                        }
                        """)
        ).andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Study"))
                .andExpect(jsonPath("$.taskType").value("SHALLOW"))
                .andExpect(jsonPath("$.completed").value(false));

        verify(taskService).createTask("Study", 1L, TaskType.SHALLOW, 60, null, null);
    }

    @Test
    void getActiveTasks() throws Exception {
        when(profileGuard.isCompleted(any())).thenReturn(true);
        Long userId = 1L;
        AppUser appUser = new AppUser();
        appUser.setId(userId);
        appUser.setEmail("test@test.com");

        Task task = new Task();
        task.setId(1L);
        task.setTitle("Active Task");

        TaskResponse response = new TaskResponse();
        response.setId(1L);
        response.setTitle("Active Task");

        when(taskService.getActiveTasks(userId)).thenReturn(List.of(task));
        when(dtoMapper.taskToTaskResponse(task)).thenReturn(response);

        AppUserPrincipal principal = new AppUserPrincipal(appUser, Map.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/tasks/active")
                        .with(authentication(auth))
                ).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Active Task"));

        verify(taskService).getActiveTasks(userId);
    }
}
