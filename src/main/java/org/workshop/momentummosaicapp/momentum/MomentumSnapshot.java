package org.workshop.momentummosaicapp.momentum;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.workshop.momentummosaicapp.user.AppUser;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","date"}))
public class MomentumSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser appUser;

    private LocalDate date;              // The day this snapshot represents
    private double dailyRhythmScore;     // Layer 1 (0.0-1.0)
    private double rollingMomentum;      // Layer 2 (0.0-1.0)
    @Enumerated(EnumType.STRING)
    private MomentumState momentumState;        // Layer 3 (enum value)
    @Enumerated(EnumType.STRING)
    private MomentumTrend trend;                // RISING, STABLE, FALLING
    @CreationTimestamp
    private Instant createdAt;

}
