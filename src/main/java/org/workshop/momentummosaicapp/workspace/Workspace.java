package org.workshop.momentummosaicapp.workspace;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.workshop.momentummosaicapp.user.AppUser;

import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(
        name = "workspace",
        indexes = {
                @Index(name = "idx_ws_user_active", columnList = "user_id,last_active_at"),
                @Index(name = "idx_ws_section",     columnList = "section_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {
    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Long id;
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "section_id")           // nullable = uncategorized
    private WorkspaceSection section;
    @Column(nullable = false, length = 200)
    private String title;
    private Integer orderIndex;
    private boolean archived = false;
    private Instant lastActiveAt;
    @CreationTimestamp
    private Instant createdAt;
    @UpdateTimestamp
    private Instant updatedAt;// Continuity signal


}
