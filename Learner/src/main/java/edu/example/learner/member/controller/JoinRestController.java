package edu.example.learner.member.controller;

import edu.example.learner.member.dto.LoginDTO;
import edu.example.learner.member.dto.MemberDTO;
import edu.example.learner.member.service.CustomUserDetailsService;
import edu.example.learner.member.service.MemberService;
import edu.example.learner.security.util.JWTUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/join")
@RequiredArgsConstructor
@Log4j2
@Tag(name = "로그인 및 회원가입 컨트롤러", description = "로그인 및 회원가입을 제공하는 API입니다.")
public class JoinRestController {
    private final MemberService memberService;
    private final JWTUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    //회원가입
    @PostMapping("/register")
    @Operation(summary = "회원가입", description = "이메일, 비밀번호, 전화번호, 닉네임을 변수로 받아 회원가입을 시도합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원가입에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "회원가입에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"회원가입에 실패하였습니다.\"}")))
    })
    public ResponseEntity<String> memberRegister(@RequestBody @Validated MemberDTO memberDTO) {
        log.info("--- memberRegister()");
        memberService.register(memberDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입에 성공하셨습니다.");
    }

    //로그인
    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일, 비밀번호을 변수로 받아 로그인을 시도합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인에 성공하였습니다."),
            @ApiResponse(responseCode = "404", description = "로그인에 실패하였습니다.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{\"error\": \"로그인에 실패하였습니다.\"}")))
    })
    public ResponseEntity<Map<String, Long>> login(@RequestBody @Validated LoginDTO loginDTO, HttpServletResponse response) throws IOException {
        log.info("--- login()");

        LoginDTO readInfo = memberService.login(loginDTO.getEmail(), loginDTO.getPassword());

        response.addCookie(readInfo.getCookie());

        Map<String, Long> responseBody = new HashMap<>();
        responseBody.put("memberId", readInfo.getMemberId());

        return ResponseEntity.ok(responseBody);
    }
}


