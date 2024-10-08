package edu.example.learner.config;

import edu.example.learner.member.service.CustomOauth2UserService;
import edu.example.learner.security.filter.JWTCheckFilter;
import edu.example.learner.security.util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig{
    private final JWTUtil jwtUtil;
    private final CustomSuccessHandler customSuccessHandler;
    private final CustomOauth2UserService customOauth2UserService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CustomClientRegistrationRepo customClientRegistrationRepo) throws Exception {
        //csrf disable
        http
                .csrf(AbstractHttpConfigurer::disable);

        //From 로그인 방식 disable
        http
                .formLogin(AbstractHttpConfigurer::disable);

        //HTTP Basic 인증 방식 disable
        http
                .httpBasic(AbstractHttpConfigurer::disable);

        //JWTFilter 추가
        http
                .addFilterBefore(new JWTCheckFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        //oauth2
        http
                .oauth2Login((oauth2) -> oauth2
                        .userInfoEndpoint((userInfoEndpointConfig) -> userInfoEndpointConfig.userService(customOauth2UserService))
                        .clientRegistrationRepository(customClientRegistrationRepo.clientRegistrationRepository())
                        .successHandler(customSuccessHandler)
                );

        //경로별 인가 작업
        http
                .authorizeHttpRequests((auth) -> auth
                        //로그인 권한 설정
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/join/*").permitAll()                                                                 //로그인 및 회원가입 모두 허용
                        .requestMatchers("/members/find/*").permitAll()                                                         //비밀번호 찾기 및 아이디 찾기 모두 허용
                        //강의 문의 권한 설정
                        .requestMatchers(HttpMethod.GET, "/course/{courseId}/course-inquiry/**").permitAll()                                      // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.POST, "/course/{courseId}/course-inquiry").hasAnyRole("USER","INSTRUCTOR","ADMIN")     // POST 요청 course 권한 설정
                        .requestMatchers(HttpMethod.DELETE, "/course/{courseId}/course-inquiry/{inquiryId}").hasAnyRole("USER","INSTRUCTOR","ADMIN")        // DELETE 요청 course 권한 설정
                        //리뷰 권한 설정
                        .requestMatchers(HttpMethod.GET,"/course/*/reviews/list").permitAll()                                               // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.DELETE, "/course/*/reviews/*").hasAnyRole("USER","INSTRUCTOR","ADMIN")        // DELETE 요청 reviews 권한 설정
                        .requestMatchers(HttpMethod.PUT, "/course/*/reviews/*").hasAnyRole("USER","INSTRUCTOR","ADMIN")           // PUT 요청 reviews 권한 설정
                        .requestMatchers(HttpMethod.POST, "/course/*/reviews/create").hasAnyRole("USER","INSTRUCTOR","ADMIN")          // POST 요청 reviews 권한 설정
                        //주문 권한 설정
                        .requestMatchers("/order/**").hasAnyRole("USER","INSTRUCTOR","ADMIN")                             //주문 관련 모두 허용
                        .requestMatchers(HttpMethod.GET,"order/list/admin").hasRole("ADMIN")                                    //주문 목록 조회 권한 설정
                        //비디오 권한 설정
                        .requestMatchers(HttpMethod.POST,"video/**").hasAnyRole("INSTRUCTOR","ADMIN")                     // POST video 권한 설정
                        .requestMatchers(HttpMethod.PUT,"video/**").hasAnyRole("INSTRUCTOR","ADMIN")                      // PUT video 권한 설정
                        .requestMatchers(HttpMethod.DELETE,"video/**").hasAnyRole("INSTRUCTOR","ADMIN")                   // DELETE video 권한 설정
                        //새소식 권한 설정
                        .requestMatchers(HttpMethod.GET,"/news/**").permitAll()                                                 //GET 요청 news 모두 허용
                        .requestMatchers(HttpMethod.PUT,"/news/**").hasAnyRole("INSTRUCTOR","ADMIN")                      //PUT 요청 news 권한 설정
                        .requestMatchers(HttpMethod.POST,"/news/**").hasAnyRole("INSTRUCTOR","ADMIN")                     //POST 요청 news 권한 설정
                        .requestMatchers(HttpMethod.DELETE,"/news/**").hasAnyRole("INSTRUCTOR","ADMIN")                   //DELETE 요청 news 권한 설정
                        //좋아요
                        .requestMatchers(HttpMethod.GET, "/like/**").permitAll()                                                 //좋아요 요청 모두 허용
                        .requestMatchers("/like/**").hasAnyRole("USER","INSTRUCTOR","ADMIN")
                        //문의 권한 설정
                        .requestMatchers(HttpMethod.GET,"/inquiries/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/inquiries/**").hasAnyRole("USER","INSTRUCTOR","ADMIN")
                        .requestMatchers(HttpMethod.PUT).hasAnyRole("USER","INSTRUCTOR","ADMIN")
                        .requestMatchers(HttpMethod.DELETE).hasAnyRole("USER","INSTRUCTOR","ADMIN")
                        //문의 답변 권한 설정
                        .requestMatchers(HttpMethod.GET, "/answers/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/answers/**").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/answers/**").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/answers/**").hasAnyRole("ADMIN")
                        //스터디 테이블 권한 설정
                        .requestMatchers("/study-tables/**").permitAll()
                        //회원 권한 설정
                        .requestMatchers("/member/{id}/other").permitAll()
                        .requestMatchers("/member/other/{nickname}").permitAll()//다른 회원 프로필 보기
                        .requestMatchers(HttpMethod.GET,"/members/instructor/*").permitAll()
                        .requestMatchers(HttpMethod.GET,"/members/instructor/{nickname}/reviews/list").permitAll()
                        .requestMatchers("/member/nickname").permitAll()//강사 프로필 보기
                        .requestMatchers("/member/**").hasAnyRole("USER","INSTRUCTOR","ADMIN")                           //로그인 된 사용자만 회원정보 수정가능
                        .requestMatchers(HttpMethod.GET,"/members/list").hasRole("ADMIN")                                      //회원 목록 조회 권한 설정
                        .requestMatchers(HttpMethod.GET, "/members/instructor/**").permitAll()   // 강사 관련 프로필 GET 요청 허용

                        //강의 권한 설정
                        .requestMatchers(HttpMethod.GET, "/course/**").permitAll()                                              // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.GET, "/course/list").permitAll()                                           // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.POST, "/course/**").hasAnyRole("INSTRUCTOR","ADMIN")                 // POST 요청 course 권한 설정
                        .requestMatchers(HttpMethod.DELETE, "/course/**").hasAnyRole("INSTRUCTOR","ADMIN")               // DELETE 요청 course 권한 설정
                        .requestMatchers(HttpMethod.PUT, "/course/**").hasAnyRole("INSTRUCTOR","ADMIN")                  // PUT 요청 course 권한 설정
                        .requestMatchers(HttpMethod.GET, "/course/{id}/list").hasAnyRole("USER", "INSTRUCTOR", "ADMIN")  // 본인 수강강의 조회
                        //정적 리소스 허용
                        .requestMatchers("/images/**").permitAll()                                                              // images 폴더에 있는 리소스 허용
                        .requestMatchers("/css/**").permitAll()                                                                 // css 폴더에 있는 리소스 허용
                        .requestMatchers("/js/**").permitAll()                                                                  // js 폴더에 있는 리소스 허용
                        //Open API 허용
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()                                     // Swagger 관련 리소스 모두 허용
                        .anyRequest().authenticated());

        //세션 설정 : STATELESS
        http
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.cors(cors -> {
            cors.configurationSource(new CorsConfigurationSource() {
                @Override
                public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                    CorsConfiguration configuration = new CorsConfiguration();

                    // 허용된 origin 설정
                    configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
                    // 모든 HTTP 메소드 허용
                    configuration.setAllowedMethods(Collections.singletonList("*"));
                    // 인증 관련 쿠키 전송을 허용
                    configuration.setAllowCredentials(true);
                    // 모든 헤더 허용
                    configuration.setAllowedHeaders(Collections.singletonList("*"));
                    // CORS 캐시 시간 설정 (1시간)
                    configuration.setMaxAge(3600L);

                    // 노출될 헤더 설정 (여러 개 추가하려면 add로 해야 함)
                    configuration.addExposedHeader("Authorization");
                    configuration.addExposedHeader("Set-Cookie");

                    return configuration;
                }
            });
        });


        return http.build();
    }
}
