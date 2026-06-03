package org.workshop.momentummosaicapp.workspace;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(
        name = "workspace_resource",
        indexes = @Index(name = "idx_resource_workspace", columnList = "workspace_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;
    @Column(nullable = false, length = 500)
    private String url;
    @Column(length = 200)
    private String label;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WorkspaceResourceType resourceType;
    private Integer orderIndex;
    @CreationTimestamp
    private Instant createdAt;
}
