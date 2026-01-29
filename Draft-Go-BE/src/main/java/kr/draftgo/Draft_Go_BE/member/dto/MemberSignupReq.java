package kr.draftgo.Draft_Go_BE.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberSignupReq {
    @NotBlank(message = "사용자명은 필수입니다.")
    @Size(min = 3, max = 20, message = "사용자명은 3자 이상 20자 이하여야 합니다.")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "게임명은 필수입니다.")
    @Size(min = 3, max = 16, message = "게임명은 3자 이상 16자 이하여야 합니다.")
    private String gameName;

    @NotBlank(message = "태그라인은 필수입니다.")
    @Size(min = 3, max = 5, message = "태그라인은 3자 이상 5자 이하여야 합니다.")
    private String tagLine;

    private Position mainPosition;
    private Position subPosition;
}
