package edu.example.learner.courseabout.service;

import edu.example.learner.courseabout.coursereview.dto.ReviewDTO;
import edu.example.learner.courseabout.coursereview.entity.ReviewType;
import edu.example.learner.courseabout.coursereview.repository.ReviewRepository;
import edu.example.learner.courseabout.coursereview.service.ReviewService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Log4j2
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ReviewServiceTest {

        @Autowired
        private ReviewService reviewService;
        @Autowired
        private ReviewRepository reviewRepository;

        @Test
        @Order(1)
        void testRegister() {
            IntStream.rangeClosed(1, 5).forEach(i -> {
                //GIVEN
                ReviewDTO reviewDTO = ReviewDTO.builder()
                        .reviewName("title"+i)
                        .reviewDetail("content" + i)
                        .courseId(1L)
                        .writerId(1L)
                        .rating(5)
                        .reviewType(ReviewType.COURSE)
                        .build();
                ReviewDTO reviewDTO2 = ReviewDTO.builder()
                        .reviewName("title " + i)
                        .reviewDetail("content" + i)
                        .courseId(1L)
                        .writerId(1L)
                        .rating(5)
                        .reviewType(ReviewType.INSTRUCTOR)
                        .build();

                //WHEN
                ReviewDTO registeredReviewDTO1 = reviewService.createReview(reviewDTO, reviewDTO.getReviewType());
                ReviewDTO registeredReviewDTO2 = reviewService.createReview(reviewDTO2, reviewDTO2.getReviewType());

                //THEN
                assertNotNull(registeredReviewDTO1);
                assertEquals(2L * i - 1, registeredReviewDTO1.getReviewId());

                log.info("--- registeredReviewDTO: " + registeredReviewDTO1);
                log.info("--- registeredReviewDTO2: " + registeredReviewDTO2);
            });
        }

        @Test
        @Order(2)
        void testRead() {
            //GIVEN
            Long reviewId = 1L;

            //WHEN
            ReviewDTO reviewDTO = reviewService.getReviewById(reviewId);

            //THEN
            assertNotNull(reviewDTO);
            assertEquals(reviewId, reviewDTO.getReviewId());

            log.info("--- foundFAQDTO: " + reviewDTO);
        }

        @Test
        @Order(3)
        void testReadAll() {
            //GIVEN
            ReviewDTO reviewDTO = reviewService.getReviewById(1L);

            //WHEN
            List<ReviewDTO> reviewDTOList = reviewService.getCourseReviewList(1L,reviewDTO);

            //THEN
            assertNotNull(reviewDTOList);
            assertEquals(10, reviewDTOList.size());

            log.info("--- faqDTOList: " + reviewDTOList);
        }


        @Test
        @Order(4)
        void testUpdate() {
            //GIVEN
            ReviewDTO reviewDTO = ReviewDTO.builder()
                    .reviewId(10L)
                    .reviewName("new title")
                    .reviewDetail("new content")
                    .reviewType(ReviewType.COURSE)
                    .build();

            //WHEN
            ReviewDTO updatedReviewDTO = reviewService.updateReview(10L, reviewDTO);

            //THEN
            assertNotNull(updatedReviewDTO);
            assertEquals("new title", updatedReviewDTO.getReviewName());
            assertEquals("new content", updatedReviewDTO.getReviewDetail());
            assertEquals(ReviewType.COURSE, updatedReviewDTO.getReviewType());

            log.info("--- updatedReviewDTO: " + updatedReviewDTO);
        }

        @Test
        @Order(5)
        void testDelete() {
            //GIVEN
            Long reviewId = 9L;
            ReviewDTO reviewDTO = ReviewDTO.builder()
                    .reviewId(reviewId)
                    .reviewName("new title")
                    .reviewDetail("new content")
                    .reviewType(ReviewType.COURSE)
                    .build();

            //WHEN
            reviewService.deleteReview(reviewId, reviewDTO);

            //THEN
            assertFalse(reviewRepository.existsById(reviewId));
        }


}
