package org.workshop.momentummosaicapp.task;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.workspace.Workspace;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Table(indexes = @Index(name = "idx_task_user_completed", columnList ="user_id,completed"))
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser appUser;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskType taskType;


    @Column(nullable = false)
    private Integer durationMinutes;

    private LocalDate plannedForDate;

    @Column(nullable = false)
    private boolean completed;

    @Enumerated(EnumType.STRING)
    private TaskStatus status =TaskStatus.PLANNED;

    private Instant completedAt;

    private Instant startedAt;

    private Integer actualMinutes;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @PrePersist
    @PreUpdate
    public void syncCompletedState(){
        completed = (status == TaskStatus.COMPLETED);
    }
}
