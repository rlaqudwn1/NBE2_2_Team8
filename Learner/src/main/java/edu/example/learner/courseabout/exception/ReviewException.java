package edu.example.learner.courseabout.exception;

public enum ReviewException {
    NOT_FOUND("NOT_FOUND", 404),
    NOT_REGISTERED("Review NOT Registered", 400),
    COURSE_NOT_FOUND("Course NOT FOUND for Review", 404),
    INSTRUCTOR_NOT_FOUND("Instructor NOT FOUND for Review", 404),
    NOT_MODIFIED("Review NOT Modified", 400),
    NOT_REMOVED("Review NOT Removed",400),
    NOT_FETCHED("Review NOT Fetched",400),
    NOT_MATCHED("Review NOT Matched", 400),
    NOT_MATCHED_REVIEWER("Reviewer NOT Matched", 400),
    INSTRUCTOR_NOT_REGISTERD("INSTRUCTOR CAN NOT REGISTER REVIEW OF ONE'S COURSE", 400);


    private ReviewTaskException reviewTaskException;

    ReviewException(String message, int code) {
        reviewTaskException = new ReviewTaskException(message, code);
    }

    public ReviewTaskException get() {
        return reviewTaskException;
    }
}
