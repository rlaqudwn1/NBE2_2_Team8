package edu.example.learner.courseabout.coursereview.dto;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.courseabout.coursereview.entity.Review;
import edu.example.learner.courseabout.coursereview.entity.ReviewType;
import edu.example.learner.member.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long reviewId;
    private String reviewName;
    private String reviewDetail;
    private int rating;
    private LocalDateTime reviewUpdatedDate;
    private ReviewType reviewType;
    private Long writerId;
    private String writerName;
    private String nickname;
    private Long courseId;

    public ReviewDTO(Review review) {
        this.reviewId = review.getReviewId();
        this.reviewName = review.getReviewName();
        this.reviewDetail = review.getReviewDetail();
        this.rating = review.getRating();
        this.reviewUpdatedDate = review.getReviewUpdatedDate();
        this.reviewType = review.getReviewType();
        this.writerId = review.getMember().getMemberId();
        this.writerName = review.getMember().getNickname();
        this.nickname = review.getCourse().getMember().getNickname();
        this.courseId = review.getCourse().getCourseId();
    }

    public Review toEntity(Course course) {
        Member member = Member.builder().memberId(writerId).build();

        return Review.builder()
                .reviewId(reviewId)
                .reviewName(reviewName)
                .reviewDetail(reviewDetail)
                .rating(rating)
                .reviewUpdatedDate(reviewUpdatedDate)
                .reviewType(reviewType)
                .member(member)
                .course(course)
                .build();
    }
}
