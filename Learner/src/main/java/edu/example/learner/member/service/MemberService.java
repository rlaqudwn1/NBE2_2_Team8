package edu.example.learner.member.service;

import com.mysql.cj.log.Log;
import edu.example.learner.member.dto.LoginDTO;
import edu.example.learner.member.entity.Member;
import edu.example.learner.member.entity.Role;
import edu.example.learner.member.exception.LoginException;
import edu.example.learner.member.exception.MemberException;
import edu.example.learner.member.dto.MemberDTO;
import edu.example.learner.member.repository.MemberRepository;
import edu.example.learner.security.util.JWTUtil;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    //회원가입
    public MemberDTO register(MemberDTO memberDTO) {

        if(memberRepository.getMemberByEmail(memberDTO.getEmail()).isPresent()){
            throw MemberException.EMAIL_ALREADY_EXISTS.getMemberTaskException();
        }

        if(memberRepository.getMemberByNickName(memberDTO.getNickname()).isPresent()){
            throw MemberException.NICKNAME_ALREADY_EXISTS.getMemberTaskException();
        }

        try{
            Member member = Member.builder()
                    .email(memberDTO.getEmail())
                    .password(passwordEncoder.encode(memberDTO.getPassword()))
                    .nickname(memberDTO.getNickname())
                    .phoneNumber(memberDTO.getPhoneNumber())
                    .role(Role.USER)
                    .build();

            memberRepository.save(member);
            return new MemberDTO(member);
        }catch (Exception e){
            log.error("회원가입 도중 오류 발생",e);
            throw MemberException.MEMBER_NOT_REGISTERED.getMemberTaskException();
        }
    }

    //사진 업로드 및 수정
    public MemberDTO uploadImage(MultipartFile file, Long memberId) {
        try{
            Member member = memberRepository.getMemberInfo(memberId);
            if(member == null){
                throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
            }
            member.changeProfileImage(file.getBytes());
            member.changeImageType(file.getContentType());
            log.info("change profile image");
            return new MemberDTO(memberRepository.save(member));
        }catch (Exception e){
            log.error(e);
            throw MemberException.NOT_UPLOAD_IMAGE.getMemberTaskException();
        }
    }

    //사진 삭제
    public void removeImage(Long memberId) {
        Member member = memberRepository.getMemberInfo(memberId);
        if(member == null){
            throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
        }
    try {
        // 프로필 이미지를 null로 설정합니다.
        member.setProfileImage(null);

        // 변경된 회원 정보를 저장합니다.
        memberRepository.save(member);
    }catch (Exception e){
        throw MemberException.NOT_REMOVE_IMAGE.getMemberTaskException();
    }

    }

    //회원 정보 조회
    public MemberDTO getMemberInfo(Long memberId) {
        try {
            Member member = memberRepository.getMemberInfo(memberId);
            MemberDTO memberDTO= new MemberDTO(member);

            return memberDTO;
        }catch (Exception e){
            log.error(e);
            throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
        }
    }

    //다른 회원 정보 조회
    public MemberDTO getMemberInfoNickName(String nickname) {
        try {
            Optional<Member> member = memberRepository.getMemberByNickName(nickname);
            MemberDTO memberDTO= new MemberDTO(member.get());

            return memberDTO;
        }catch (Exception e){
            log.error(e);
            throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
        }
    }

    //강사 이름 조회
    public MemberDTO getInstructorInfo(String nickname) {
        try {
            Member member = memberRepository.getMemberByNickName(nickname).orElseThrow();
            MemberDTO memberDTO= new MemberDTO(member);

            return memberDTO;
        }catch (Exception e){
            log.error(e);
            throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
        }
    }

    //회원 정보 수정
    public MemberDTO updateMemberInfo(Long memberId, MemberDTO memberDTO) {
        Member member = memberRepository.getMemberInfo(memberId);
        if(member == null){
            throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
        }

        //닉네임 수정
        try {
            member.changeNickname(memberDTO.getNickname());
        }catch (Exception e){
            throw MemberException.NICKNAME_ALREADY_EXISTS.getMemberTaskException();
        }

        try{
            member.changeIntroduction(memberDTO.getIntroduction());
            member.changePassword(passwordEncoder.encode(memberDTO.getPassword()));

            MemberDTO modifyMemberDTO = new MemberDTO(memberRepository.save(member));

            return modifyMemberDTO;
        }catch (Exception e){
            log.error(e);
            throw MemberException.MEMBER_NOT_MODIFIED.getMemberTaskException();
        }
    }

    //회원 탈퇴
    public void deleteMember(Long memberId) {
        Member member = memberRepository.getMemberInfo(memberId);
        if(member == null){
            throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
        }

        try{
            memberRepository.delete(member);
        } catch (Exception e){
            log.error(e);
            throw MemberException.MEMBER_NOT_DELETE.getMemberTaskException();
        }
    }

    //로그인
    public LoginDTO login(String email, String password) {
        Member member = memberRepository.getMemberByEmail(email).orElseThrow(LoginException.NOT_FOUND_EMAIL::getMemberTaskException);

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw LoginException.PASSWORD_DISAGREEMENT.getMemberTaskException();
        }

        // JWT 생성 및 쿠키 반환
        String accessToken = jwtUtil.createToken(Map.of("mid", member.getEmail(), "role", member.getRole()), 30);        Cookie cookie = new Cookie("Authorization", accessToken);
        cookie.setMaxAge(60 * 60 * 60); // 60시간
        cookie.setPath("/"); // 전체 경로에서 접근 가능
        cookie.setHttpOnly(false); // JavaScript에서 접근 가능
        cookie.setSecure(false); // 로컬 개발 시 false로 설정

        return new LoginDTO(cookie, member.getMemberId());
    }

    //이메일로 닉네임 얻기
    public String getNicknameByEmail(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 회원을 찾을 수 없습니다."));
        return member.getNickname();
    }

    //비밀번호 인증
    public boolean verifyPassword(Long memberId, String rawPassword) {
        Member member = memberRepository.getMemberInfo(memberId);
         if(member == null){
              throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
         }
         log.info("인증 비밀번호 " + rawPassword);
         log.info("본래 비밀번호 " + member.getPassword());
        // 저장된 비밀번호와 입력된 비밀번호를 비교합니다.
        return passwordEncoder.matches(rawPassword, member.getPassword());
    }
}
