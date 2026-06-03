package org.workshop.momentummosaicapp.workspace;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(
        name = "workspace_entry",
        indexes = {
                @Index(name = "idx_entry_workspace", columnList = "workspace_id,order_index"),
                @Index(name = "idx_entry_parent",    columnList = "parent_entry_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_entry_id")
    private WorkspaceEntry parentEntry;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkspaceEntryType entryType;
    // Plain text only. No markdown, no HTML, no formatting.
    @Column(columnDefinition = "TEXT")
    private String content;
    @Column(nullable = false)
    private boolean collapsed = false;
    @Column(nullable = false)
    private Integer orderIndex;
    @CreationTimestamp
    private Instant createdAt;
    @UpdateTimestamp
    private Instant updatedAt;

}
