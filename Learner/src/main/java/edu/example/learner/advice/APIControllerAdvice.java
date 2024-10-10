package edu.example.learner.advice;

import edu.example.learner.courseabout.exception.*;
import edu.example.learner.courseabout.order.exception.OrderTaskException;
import edu.example.learner.member.exception.LoginException;
import edu.example.learner.member.exception.LoginTaskException;
import edu.example.learner.member.exception.MemberTaskException;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Log4j2
public class APIControllerAdvice {
    //validation 예외처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        Map<String, Object> errMap = new HashMap<>();
        errMap.put("error", "Type Mismatched.");

        return new ResponseEntity<>(errMap, HttpStatus.BAD_REQUEST);
    }

    //member 예외처리
    @ExceptionHandler(MemberTaskException.class)
    public ResponseEntity<?> handleMemberException(MemberTaskException e) {
        log.info("--- MemberTaskException");
        log.info("--- e.getClass().getName() : " + e.getClass().getName());
        log.info("--- e.getMessage() : " + e.getMessage());

        Map<String, String> errMap = Map.of("error", e.getMessage());


        return ResponseEntity.status(e.getStatusCode()).body(errMap);
    }

    //Login 예외처리
    @ExceptionHandler(LoginTaskException.class)
    public ResponseEntity<?> handleLoginException(LoginTaskException e) {
        log.info("--- MemberTaskException");
        log.info("--- e.getClass().getName() : " + e.getClass().getName());
        log.info("--- e.getMessage() : " + e.getMessage());

        Map<String, String> errMap = Map.of("error", e.getMessage());


        return ResponseEntity.status(e.getStatusCode()).body(errMap);
    }

    @ExceptionHandler(ReviewTaskException.class)
    public ResponseEntity<?> handleLoginException(ReviewTaskException e) {
        log.info("--- MemberTaskException");
        log.info("--- e.getClass().getName() : " + e.getClass().getName());
        log.info("--- e.getMessage() : " + e.getMessage());

        Map<String, String> errMap = Map.of("error", e.getMessage());


        return ResponseEntity.status(e.getStatusCode()).body(errMap);
    }

    //파일 업로드 예외처리
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                .body("File too large!");
    }

    //장바구니 예외처리
    @ExceptionHandler(OrderTaskException.class)
    public ResponseEntity<Map<String, Object>> handleOrderException(OrderTaskException e){
        log.error("OrderTaskException : ", e);
        log.error("--- e.getClass().getName() : " + e.getClass().getName());
        log.error("--- e.getMessage() : " + e.getMessage());
        Map<String, Object> errMap = Map.of("error", e.getMessage());


        return ResponseEntity.status(e.getCode()).body(errMap);
    }
    //
    @ExceptionHandler(CourseTaskException.class)
    public ResponseEntity<Map<String,Object>> handelCourseException(CourseTaskException e){
        log.error("CourseTaskException : ", e);
        log.error("--- e.getClass().getName() : " + e.getClass().getName());
        log.error("--- e.getMessage() : " + e.getMessage());
        Map<String, Object> errMap = Map.of("error", e.getMessage());

        return ResponseEntity.status(e.getStatusCode()).body(errMap);
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());  // 예외 메시지를 그대로 전송
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFoundException(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }

    @ExceptionHandler(HeartNewsAlreadyExistsException.class)
    public ResponseEntity<String> handleHeartNewsAlreadyExistsException(HeartNewsAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

}
