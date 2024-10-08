package edu.example.learner.courseabout.coursereview.entity;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;
    private String reviewName;
    private String reviewDetail;
    private int rating;

    @CreatedDate
    private LocalDateTime reviewCreatedDate;

    @LastModifiedDate
    private LocalDateTime reviewUpdatedDate;

    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    public void changeReviewName(String reviewName) {
        this.reviewName = reviewName;
    }

    public void changeReviewDetail(String reviewDetail) {
        this.reviewDetail = reviewDetail;
    }

    public void changeRating(int rating) {
        this.rating = rating;
    }
}
