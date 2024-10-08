package edu.example.learner.security.filter;

import edu.example.learner.security.auth.CustomUserPrincipal;
import edu.example.learner.security.util.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("--- doFilterInternal() ");
        log.info("--- requestURI : " + request.getRequestURI());

        // 필터링할 경로 설정
        String[] doFilterPath = {"/course", "/members", "/order", "/reviews", "/video", "/news", "/like", "/course-inquiry", "/inquiries", "/answers", "study-table"};
        boolean doFilter = false;

        // 요청 URI 및 HTTP 메소드 확인
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        log.info("method : " + method);
        log.info("requestURI : " + requestURI);

        // 필터링 로직
        for (String path : doFilterPath) {
            if (requestURI.startsWith(path)) {
                log.info("--- JWT verification for path: " + requestURI);

                // 필터 적용 조건 메소드 호출
                if (shouldFilterRequest(path, method, requestURI)) {
                    doFilter = true;
                    break; // 조건에 맞으면 더 이상 확인하지 않음
                }
            }
        }
        log.info("doFilter : " + doFilter);

        // 필터를 적용하지 않는 경우, 다음 필터로 요청 전달
        if (!doFilter) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization 쿠키에서 토큰 추출
        String authorization = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                log.info("cookie : " + cookie.getName());
                if (cookie.getName().equals("Authorization")) {
                    authorization = cookie.getValue();
                }
            }
        } else {
            log.info("--- No cookies found");
        }

        log.info("--- authorization : " + authorization);

        if (authorization == null) {
            handleException(response, new Exception("ACCESS TOKEN NOT FOUND"));
            return;
        }

        // 토큰 유효성 검증
        String accessToken = authorization;

        try {
            Map<String, Object> claims = jwtUtil.validateToken(accessToken);
            log.info("--- 토큰 유효성 검증 완료 ---");

            // SecurityContext 처리
            String mid = claims.get("mid").toString();
            String role = claims.get("role").toString(); // 단일 역할 처리

            // 토큰을 이용하여 인증된 정보 저장
            UsernamePasswordAuthenticationToken authToken
                    = new UsernamePasswordAuthenticationToken(new CustomUserPrincipal(mid, role), null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));

            log.info("authToken : " + authToken);

            // SecurityContext에 인증/인가 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authToken);

            log.info("SecurityContext에 인증/인가 정보 저장");

            // OAuth2 인증 생략, 다음 필터로 요청 전달
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            handleException(response, e); // 예외 발생 시 처리
        }
    }

    public void handleException(HttpServletResponse response, Exception e) throws IOException {
        log.info("--- handleException ---");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().println("{\"error\": \"" + e.getMessage() + "\"}");
    }

    private boolean shouldFilterRequest(String path, String method, String requestURI) {
        boolean isGetRequest = method.equals("GET");
        boolean isPostPutDeleteRequest = method.equals("POST") || method.equals("PUT") || method.equals("DELETE") || method.equals("PATCH");

        log.info("path : " + path);

        switch (path) {
            case "/course":
                // /course 및 그 하위 경로는 GET 요청에 대해 필터를 적용하지 않음
                return isPostPutDeleteRequest; // POST, PUT, DELETE 요청에 대해서만 필터 적용
            case "/members":
                return requestURI.matches("/members/\\d+(?!/other)(?!/instructor).*") && (isPostPutDeleteRequest || isGetRequest);
            case "/reviews":
                return isPostPutDeleteRequest;
            case "/order":
                return true; // 모든 요청에 대해 필터 적용
            case "/video":
                return true; // 모든 요청에 대해 필터 적용
            case "/news":
                return isPostPutDeleteRequest;
            case "/like":
                return true; // 모든 요청에 대해 필터 적용
            case "/course-inquiry":
                return isPostPutDeleteRequest;
            case "/inquiries":
                return isPostPutDeleteRequest;
            case "/answers":
                return true;
            case "/study-table":
                return isPostPutDeleteRequest;
            default:
                return false; // 기본적으로 필터 적용 안 함
        }
    }
}
