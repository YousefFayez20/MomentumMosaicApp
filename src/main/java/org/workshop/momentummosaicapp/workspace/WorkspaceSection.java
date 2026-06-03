package org.workshop.momentummosaicapp.workspace;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.workshop.momentummosaicapp.user.AppUser;

import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(
        name = "workspace_section",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_section_user_name",
                columnNames = {"user_id", "name"}
        )
)
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class WorkspaceSection {
    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Long id;
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;
    @Column(nullable = false, length = 100)
    private String name;             // "DSA", "System Design", etc.
    private Integer orderIndex;      // User-defined ordering
    @CreationTimestamp
    private Instant createdAt;
}
