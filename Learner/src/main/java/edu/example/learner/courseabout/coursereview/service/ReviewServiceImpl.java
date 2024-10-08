package edu.example.learner.courseabout.coursereview.service;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.courseabout.course.service.CourseServiceImpl;
import edu.example.learner.courseabout.coursereview.dto.ReviewDTO;
import edu.example.learner.courseabout.coursereview.entity.Review;
import edu.example.learner.courseabout.coursereview.entity.ReviewType;
import edu.example.learner.courseabout.exception.ReviewException;
import edu.example.learner.courseabout.coursereview.repository.ReviewRepository;
import edu.example.learner.courseabout.exception.ReviewTaskException;
import edu.example.learner.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseServiceImpl courseService;
    private final MemberService memberService;

    @Override
    public ReviewDTO createReview(ReviewDTO reviewDTO, ReviewType reviewType) {
        try {
            Course course = courseService.read(reviewDTO.getCourseId()).toEntity();

            if (reviewDTO.getWriterId().equals(course.getMember().getMemberId())) {
                throw ReviewException.INSTRUCTOR_NOT_REGISTERD.get();
            }

            reviewDTO.setWriterName(memberService.getMemberInfo(reviewDTO.getWriterId()).getNickname());
            reviewDTO.setReviewType(reviewType);

            Review review = reviewDTO.toEntity(course);
            System.out.println(review);
            reviewRepository.save(review);
            return new ReviewDTO(review);
        } catch (Exception e) {
            log.error("--- e : " + e);
            log.error("--- " + e.getMessage()); //에러 로그로 발생 예외의 메시지를 기록하고
            throw ReviewException.NOT_REGISTERED.get();
        }
    }

    @Override
    public ReviewDTO getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(ReviewException.NOT_FOUND::get);
        return new ReviewDTO(review);
    }

    @Override
    public ReviewDTO updateReview(Long reviewId, ReviewDTO reviewDTO) {
        Course course = courseService.read(reviewDTO.getCourseId()).toEntity();

        Review review = reviewRepository.findById(reviewId).orElseThrow(ReviewException.NOT_FOUND::get);
        if (review.getMember().getMemberId() != reviewDTO.getWriterId()) {
            throw ReviewException.NOT_MATCHED_REVIEWER.get();
        }
        if (reviewDTO.getRating() == 0) {
            reviewDTO.setRating(1);
        }

        Review newReview = reviewDTO.toEntity(course);

        try {
            review.changeReviewName(newReview.getReviewName());
            review.changeReviewDetail(newReview.getReviewDetail());
            review.changeRating(newReview.getRating());

            reviewRepository.save(review);
            return new ReviewDTO(review);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw ReviewException.NOT_MODIFIED.get();
        }
    }

    @Override
    public void deleteReview(Long reviewId, ReviewDTO reviewDTO) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(ReviewException.NOT_FOUND::get);

        if (review.getMember().getMemberId() != reviewDTO.getWriterId()) {
            throw ReviewException.NOT_MATCHED_REVIEWER.get();
        }

        try {
            reviewRepository.delete(review);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw ReviewException.NOT_REMOVED.get();
        }
    }

    @Override
    public List<ReviewDTO> getCourseReviewList(Long courseId, ReviewDTO reviewDTO) {

        // COURSE인 리뷰만 가져오기 위해 필터링
        List<Review> reviewList = reviewRepository.getCourseReview(courseId).orElse(null);
        List<ReviewDTO> reviewDTOList = new ArrayList<>();

        if (reviewList == null || reviewList.isEmpty()) {
            return reviewDTOList;
        }

        // 리뷰 타입이 COURSE인 것만 필터링
        reviewList.stream()
                .filter(review -> review.getReviewType() == ReviewType.COURSE)
                .forEach(review -> {
                    reviewDTOList.add(ReviewDTO.builder()
                            .reviewId(review.getReviewId())
                            .reviewName(review.getReviewName())
                            .reviewDetail(review.getReviewDetail())
                            .rating(review.getRating())
                            .reviewType(review.getReviewType())
                            .reviewUpdatedDate(review.getReviewUpdatedDate())
                            .writerId(review.getMember().getMemberId())
                            .courseId(courseId)
                            .writerName(review.getMember().getNickname())
                            .nickname(review.getCourse().getMember().getNickname())
                            .build());
                });

        return reviewDTOList;
    }


    @Override
    public List<ReviewDTO> getInstructorReviewList(Long courseId, String nickname, ReviewDTO reviewDTO) {
        List<Review> reviewList = reviewRepository.getInstructorReview(reviewDTO.getNickname()).orElse(null);

        List<ReviewDTO> reviewDTOList = new ArrayList<>();
        if (reviewList == null || reviewList.isEmpty()) {
            return reviewDTOList;
        }

        // 리뷰 타입이 INSTRUCTOR인 것만 필터링
        reviewList.stream()
                .filter(review -> review.getReviewType() == ReviewType.INSTRUCTOR)
                .forEach(review -> {
                    reviewDTOList.add(ReviewDTO.builder()
                            .reviewId(review.getReviewId())
                            .reviewName(review.getReviewName())
                            .reviewDetail(review.getReviewDetail())
                            .rating(review.getRating())
                            .reviewType(review.getReviewType())
                            .reviewUpdatedDate(review.getReviewUpdatedDate())
                            .writerId(review.getMember().getMemberId())
                            .courseId(courseId)
                            .nickname(nickname)
                            .writerName(review.getMember().getNickname())
                            .build());
                });

        return reviewDTOList;
    }
}