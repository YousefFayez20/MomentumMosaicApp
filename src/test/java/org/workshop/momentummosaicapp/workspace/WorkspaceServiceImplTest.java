package org.workshop.momentummosaicapp.workspace;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.workshop.momentummosaicapp.task.TaskRepository;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.workspace.dto.CreateWorkspaceRequest;
import org.workshop.momentummosaicapp.workspace.dto.WorkspaceResponse;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkspaceServiceImplTest {

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private WorkSpaceSectionRepository workSpaceSectionRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private WorkSpaceEntryRepository workSpaceEntryRepository;

    @Mock
    private WorkspaceResourceRepository workspaceResourceRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private WorkspaceServiceImpl workspaceService;

    @Test
    void createWorkspaceWithoutSectionReturnsNullSectionFields() {
        Long userId = 7L;
        AppUser user = new AppUser();
        user.setId(userId);
        user.setEnabled(true);

        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));
        when(workspaceRepository.save(any(Workspace.class))).thenAnswer(invocation -> {
            Workspace workspace = invocation.getArgument(0);
            workspace.setId(99L);
            return workspace;
        });

        WorkspaceResponse response = workspaceService.createWorkspace(userId, new CreateWorkspaceRequest("Algorithms", null));

        assertEquals(99L, response.getId());
        assertEquals("Algorithms", response.getTitle());
        assertNull(response.getSectionId());
        assertNull(response.getSectionName());
    }
}
