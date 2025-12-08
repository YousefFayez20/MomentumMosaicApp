package org.workshop.momentummosaicapp.fitness;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.workshop.momentummosaicapp.user.User;
import java.time.Instant;
import java.time.LocalDate;


@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Table(
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"})
)
public class DailyFitnessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean didWorkout;
    @CreationTimestamp
    private Instant createdAt;


}
