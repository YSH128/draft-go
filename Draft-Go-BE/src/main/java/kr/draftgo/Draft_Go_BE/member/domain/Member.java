package kr.draftgo.Draft_Go_BE.member.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import lombok.NoArgsConstructor;
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
    @Column(name = "sub_position", length = 15)
    private Position subPosition;

    @Column(name = "bio", length = 150)
    private String bio;

    @Column(name = "profile_icon_id")
    private Integer profileIconId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;

    // MemberStat과의 관계는 1:N이므로 직접 참조하지 않음
    // MemberStatRepository를 통해 필요한 시즌의 stat을 조회할 것

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
        this.role = (role != null) ? role : Role.USER;
        this.createdAt = LocalDateTime.now();
    }

    public void updateProfile(Position mainPosition, Position subPosition, String bio) {
        if (mainPosition != null) {
            this.mainPosition = mainPosition;
        }
        if (subPosition != null) {
            this.subPosition = subPosition;
        }
        if (bio != null) {
            this.bio = bio;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void updateProfileIcon(Integer profileIconId) {
        if (profileIconId != null) {
            this.profileIconId = profileIconId;
        }
    }

    public void updatePuuid(String puuid) {
        if (puuid != null && !puuid.isEmpty()) {
            this.puuid = puuid;
        }
    }

    public void refreshUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getNickname() {
        return this.gameName + "#" + this.tagLine;
    }
}
