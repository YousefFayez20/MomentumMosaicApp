package org.workshop.momentummosaicapp.user;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;


@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = true)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(unique = true,nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)

    private Role role = Role.USER;

    @Column(nullable = false)

    private boolean enabled = true;


    @Column(nullable = true)
    private Integer heightCm;

    @Column(nullable = true)
    private Integer weightKg;

    @CreationTimestamp
    private Instant createdAt;
    @Column(nullable = false)
    private boolean profileCompleted = false;




}
