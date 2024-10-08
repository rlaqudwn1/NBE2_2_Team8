package edu.example.learner.member.controller;

import edu.example.learner.member.dto.MemberDTO;
import edu.example.learner.member.entity.Member;
import edu.example.learner.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
@Log4j2
@Tag(name = "회원 컨트롤러", description = "회원 조회, 수정, 탈퇴와 관련된 API입니다.")
public class MemberRestController {
    private final MemberService memberService;

    //이미지 업로드
    @PutMapping("/{memberId}/image")
    @Operation(summary = "이미지 업로드", description = "사진 파일을 받아 프로필 사진을 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 변경에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "프로필 변경에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"프로필 변경에 실패하였습니다.\"}")))
    })
    public ResponseEntity<String> memberUploadImage(@RequestParam("file") MultipartFile file,
                                                    @PathVariable Long memberId) {
        log.info("--- memberUploadImage()");
        //파일 크기 제한
        if (!file.isEmpty() && file.getSize() > 2097152) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("파일 크기가 너무 큽니다.");
        }

        //이미지 파일인지 확인
        if (!file.getContentType().startsWith("image/")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이미지 파일만 업로드 가능해요👻");
        }

        try {
            memberService.uploadImage(file, memberId);
            return ResponseEntity.status(HttpStatus.CREATED).body("Image uploaded successfully");
        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading image: " + e.getMessage());
        }
    }

    //이미지 삭제
    @DeleteMapping("{memberId}/image")
    @Operation(summary = "이미지 삭제", description = "프로필 사진을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 삭제에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "프로필 삭제에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"프로필 삭제에 실패하였습니다.\"}")))
    })
    public ResponseEntity<String> deleteMember(@PathVariable Long memberId) {
        log.info("--- memberDelete()");
        memberService.removeImage(memberId);

        return ResponseEntity.status(HttpStatus.CREATED).body("이미지가 성공적으로 삭제되었습니다.");
    }

    //마이페이지
    @GetMapping("/{memberId}")
    @Operation(summary = "회원 조회", description = "회원의 개인정보를 가져옵니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 조회에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "회원 조회에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"회원 조회에 실패하였습니다.\"}")))
    })
    public ResponseEntity<MemberDTO> myPageRead(@PathVariable Long memberId) {
        log.info("--- myPageRead()");
        log.info(memberId);
        log.info(memberService.getMemberInfo(memberId));

        return ResponseEntity.ok(memberService.getMemberInfo(memberId));
    }

    //다른 사용자 조회
    @GetMapping("/{nickname}/other")
    @Operation(summary = "다른 회원 조회", description = "다른 회원의 공개된 정보를 가져옵니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "다른 회원 조회에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "다른 회원 조회에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"다른 회원 조회에 실패하였습니다.\"}")))
    })
    public ResponseEntity<MemberDTO> memberRead(@RequestParam String nickname) {
        log.info("--- memberRead()");
        MemberDTO memberDTO = memberService.getMemberInfoNickName(nickname);
        //본인이 아닌 사용자 조회시 개인정보빼고 정보 전달
        return ResponseEntity.ok(memberDTO.getNonSensitiveInfo(memberDTO));
    }

    //회원 정보 수정
    @PutMapping("/{memberId}")
    @Operation(summary = "회원 정보 수정", description = "회원의 이메일, 비밀번호, 닉네임을 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 정보 수정회에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "회원 정보 수정에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"회원 정보 수정에 실패하였습니다.\"}")))
    })
    public ResponseEntity<MemberDTO> memberModify(@RequestBody @Validated MemberDTO memberDTO,
                                                  @PathVariable Long memberId) {
        log.info("--- memberModify()");

        return ResponseEntity.ok(memberService.updateMemberInfo(memberId,memberDTO));
    }

    //비밀번호 인증
    @PostMapping("/{memberId}/verify-password")
    public ResponseEntity<String> verifyPassword(@PathVariable Long memberId, @RequestBody String password) {
        boolean isVerified = memberService.verifyPassword(memberId, password);
        log.info("password : " + password );
        if (isVerified) {
            return ResponseEntity.ok("비밀번호 인증 성공!");
        } else {
            return ResponseEntity.status(403).body("비밀번호가 일치하지 않습니다.");
        }
    }

    //회원 탈퇴
    @DeleteMapping("/{memberId}")
    public ResponseEntity<String> memberDelete(@PathVariable Long memberId) {
        log.info("--- memberDelete()");

        memberService.deleteMember(memberId);

        return ResponseEntity.ok("회원 탈퇴에 성공하였습니다.");
    }

    //강사 이름으로 조회
    @GetMapping("/instructor/{nickname}")
    public ResponseEntity<MemberDTO> getInstructorByNickname(@PathVariable String nickname) {
        log.info("--- myPageRead()");
        log.info(nickname);
        return ResponseEntity.ok(memberService.getInstructorInfo(nickname));
    }

    //회원 목록 조회
    @GetMapping("/list")
    public ResponseEntity <List<MemberDTO>> listMembers() {
        log.info("--- myPageRead()");

        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @GetMapping("/nickname")
    @Operation(summary = "이메일로 닉네임 조회", description = "이메일로 닉네임을 조회합니다.")
    public ResponseEntity<String> getNickname(@RequestParam String email) {
        String nickname = memberService.getNicknameByEmail(email);

        if (nickname != null) {
            return ResponseEntity.ok(nickname);  // 닉네임을 성공적으로 반환
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("닉네임을 찾을 수 없습니다.");
        }
    }
}
