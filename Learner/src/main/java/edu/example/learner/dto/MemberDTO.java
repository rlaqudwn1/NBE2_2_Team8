package edu.example.learner.dto;

import edu.example.learner.entity.Member;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.tomcat.util.codec.binary.Base64;


import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDTO {
    private Long memberId;

    @NotNull
    private String email;

    @NotNull
    private String password;

    @NotNull
    private String nickname;

    private String phoneNumber;

    private String profileImage;

    private String imageType;

    @NotNull
    private String introduction;

    private LocalDateTime createDate;

    public MemberDTO(Member member) {
        this.memberId = member.getMemberId();
        this.email = member.getEmail();
        this.password = member.getPassword();
        this.nickname = member.getNickname();
        this.phoneNumber = member.getPhoneNumber();
        this.createDate = member.getCreateDate();
        this.introduction = member.getIntroduction();
        this.imageType = member.getImageType();
        // 이미지를 Base64로 인코딩하여 저장
        if (member.getProfileImage() != null) {
            this.profileImage = Base64.encodeBase64String(member.getProfileImage());
        }
    }

    public MemberDTO getNonSensitiveInfo(MemberDTO member) {
        this.email = null; // 이메일 삭제
        this.password = null; // 비밀번호 삭제
        this.phoneNumber = null; // 전화번호 삭제
        this.createDate = null;
        // 다른 민감한 정보도 필요에 따라 삭제
        return this;
    }
}