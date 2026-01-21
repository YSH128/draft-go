package kr.draftgo.Draft_Go_BE.member.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@ToString(exclude = "password")
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 16)
    private String gameName;

    @Column(nullable = false, length = 5)
    private String tagLine;

    @Column(unique = true, length = 100)
    private String puuid;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Position mainPosition;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Position subPosition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder
    public Member(String username, String password, String gameName, String tagLine, String puuid,
                  Position mainPosition, Position subPosition, Role role) {
        this.username = username;
        this.password = password;
        this.gameName = gameName;
        this.tagLine = tagLine;
        this.puuid = puuid;
        this.mainPosition = mainPosition;
        this.subPosition = subPosition;
        this.role = (role != null) ? role : Role.USER; // role이 지정되면 사용, 아니면 기본값 USER
        this.createdAt = LocalDateTime.now();
    }

    public void updateProfile(Position mainPosition, Position subPosition) {
        if (mainPosition != null) {
            this.mainPosition = mainPosition;
        }
        if (subPosition != null) {
            this.subPosition = subPosition;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void refreshUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
