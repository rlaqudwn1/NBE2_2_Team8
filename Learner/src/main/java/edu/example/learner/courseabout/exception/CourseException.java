package edu.example.learner.courseabout.exception;

import org.springframework.http.HttpStatus;

public enum CourseException {
    COURSE_NOT_FOUND("COURSE NOT FOUND",HttpStatus.NOT_FOUND),
    COURSE_ADD_FAILED("COURSE ADD FALIED", HttpStatus.BAD_REQUEST),
    COURSE_NOT_MODIFIED("COURSE NOT MODIFIED", HttpStatus.BAD_REQUEST),
    COURSE_NOT_DELETED("COURSE NOT DELETED", HttpStatus.BAD_REQUEST),
    MEMBER_COURSE_NOT_FOUND("MEMBER COURSE NOT FOUND", HttpStatus.BAD_REQUEST);


    private String message;
    private HttpStatus status;

    CourseException(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    public CourseTaskException getCourseException() {
        return new CourseTaskException(this.message,this.status.value());
    }

}
