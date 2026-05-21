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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.workshop.momentummosaicapp.dashboard.DashboardResponsePackage.DashboardResponse;
import org.workshop.momentummosaicapp.dashboard.DashboardService;
import org.workshop.momentummosaicapp.security.JwtAuthenticationFilter;
import org.workshop.momentummosaicapp.security.ProfileCompletionFilter;
import org.workshop.momentummosaicapp.security.ProfileGuard;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserPrincipal;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = DashboardController.class,
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
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private ProfileGuard profileGuard;

    @Test
    void getDashboard() throws Exception {
        when(profileGuard.isCompleted(any())).thenReturn(true);
        Long userId = 1L;
        AppUser user = new AppUser();
        user.setId(userId);

        AppUserPrincipal principal = new AppUserPrincipal(user, Map.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(dashboardService.getDashboard(userId)).thenReturn(new DashboardResponse());

        mockMvc.perform(get("/api/dashboard")
                        .with(authentication(auth))
                ).andExpect(status().isOk());

        verify(dashboardService).getDashboard(userId);
    }
}
