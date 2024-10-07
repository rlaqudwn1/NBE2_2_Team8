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
                .csrf((auth) -> auth.disable());

        //From 로그인 방식 disable
        http
                .formLogin((auth) -> auth.disable());

        //HTTP Basic 인증 방식 disable
        http
                .httpBasic((auth) -> auth.disable());

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
                        .requestMatchers("/join/*").permitAll()                                                            //로그인 및 회원가입 모두 허용
                        .requestMatchers("/find/*").permitAll()                                                            //비밀번호 찾기 및 아이디 찾기 모두 허용
                        //회원 권한 설정
                        .requestMatchers("/member/{id}/other").permitAll()                                                 //다른 회원 프로필 보기
                        .requestMatchers("/member/instructor").permitAll()                                                 //강사 프로필 보기
                        .requestMatchers("/member/*").hasAnyRole("USER","INSTRUCTOR","ADMIN")                        //로그인 된 사용자만 회원정보 수정가능
                        .requestMatchers(HttpMethod.GET,"/members/list").hasRole("ADMIN")                                  //회원 목록 조회 권한 설정
                        //강의 권한 설정
                        .requestMatchers(HttpMethod.GET, "/course").permitAll()                                            // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.GET, "/course/list").permitAll()                                            // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.POST, "/course").hasAnyRole("INSTRUCTOR","ADMIN")                // POST 요청 course 권한 설정
                        .requestMatchers(HttpMethod.DELETE, "/course").hasAnyRole("INSTRUCTOR","ADMIN")              // DELETE 요청 course 권한 설정
                        .requestMatchers(HttpMethod.PUT, "/course").hasAnyRole("INSTRUCTOR","ADMIN")                 // PUT 요청 course 권한 설정
                        .requestMatchers(HttpMethod.GET, "/course/{id}/list").hasAnyRole("USER", "INSTRUCTOR", "ADMIN")  // 본인 수강강의 조회
                        //리뷰 권한 설정
                        .requestMatchers(HttpMethod.GET,"/reviews").permitAll()                                             // GET 요청 course 모두 허용
                        .requestMatchers(HttpMethod.POST, "/reviews").hasAnyRole("USER","INSTRUCTOR","ADMIN")        // POST 요청 reviews 권한 설정
                        .requestMatchers(HttpMethod.DELETE, "/reviews").hasAnyRole("USER","INSTRUCTOR","ADMIN")      // DELETE 요청 reviews 권한 설정
                        .requestMatchers(HttpMethod.PUT, "/reviews").hasAnyRole("USER","INSTRUCTOR","ADMIN")         // PUT 요청 reviews 권한 설정
                        //주문 권한 설정
                        .requestMatchers("/order/").hasAnyRole("USER","INSTRUCTOR","ADMIN")                          //주문 관련 모두 허용
                        .requestMatchers(HttpMethod.GET,"order/list").hasRole("ADMIN")                                     //주문 목록 조회 권한 설정
                        //비디오 권한 설정
                        .requestMatchers(HttpMethod.POST,"video").hasAnyRole("INSTRUCTOR","ADMIN")                   // POST video 권한 설정
                        .requestMatchers(HttpMethod.PUT,"video").hasAnyRole("INSTRUCTOR","ADMIN")                    // PUT video 권한 설정
                        .requestMatchers(HttpMethod.DELETE,"video").hasAnyRole("INSTRUCTOR","ADMIN")                 // DELETE video 권한 설정
                        //새소식 권한 설정
                        .requestMatchers(HttpMethod.GET,"/news").permitAll()                                               //GET 요청 news 모두 허용
                        .requestMatchers(HttpMethod.PUT,"/news").hasAnyRole("INSTRUCTOR","ADMIN")                    //PUT 요청 news 권한 설정
                        .requestMatchers(HttpMethod.POST,"/news").hasAnyRole("INSTRUCTOR","ADMIN")                   //POST 요청 news 권한 설정
                        .requestMatchers(HttpMethod.DELETE,"/news").hasAnyRole("INSTRUCTOR","ADMIN")                 //DELETE 요청 news 권한 설정
                        //좋아요
                        .requestMatchers("/like").hasAnyRole("USER","INSTRUCTOR","ADMIN")                            //좋아요 요청 모두 허용
                        //정적 리소스 허용
                        .requestMatchers("/images/**").permitAll()                                                         // images 폴더에 있는 리소스 허용
                        .requestMatchers("/css/**").permitAll()                                                            // css 폴더에 있는 리소스 허용
                        .requestMatchers("/js/**").permitAll()                                                             // js 폴더에 있는 리소스 허용
                        //Open API 허용
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()                                // Swagger 관련 리소스 모두 허용
                        .anyRequest().authenticated());

        //세션 설정 : STATELESS
        http
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.cors(cors -> {
            cors.configurationSource(new CorsConfigurationSource(){
                @Override
                public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                    CorsConfiguration configuration = new CorsConfiguration();

                    configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
                    configuration.setAllowedMethods(Collections.singletonList("*"));
                    configuration.setAllowCredentials(true);
                    configuration.setAllowedHeaders(Collections.singletonList("*"));
                    configuration.setMaxAge(3600L);

                    configuration.setExposedHeaders(Collections.singletonList("Set-Cookie"));
                    configuration.setExposedHeaders(Collections.singletonList("Authorization"));

                    return configuration;
                }
            });
        });

        return http.build();
    }
}
