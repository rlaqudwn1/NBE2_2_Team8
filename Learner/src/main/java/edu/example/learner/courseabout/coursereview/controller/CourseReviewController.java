package edu.example.learner.courseabout.coursereview.controller;

import edu.example.learner.courseabout.course.service.CourseServiceImpl;
import edu.example.learner.courseabout.coursereview.dto.ReviewDTO;
import edu.example.learner.courseabout.coursereview.entity.ReviewType;
import edu.example.learner.courseabout.coursereview.service.ReviewServiceImpl;
import edu.example.learner.member.service.MemberService;
import edu.example.learner.security.auth.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/course/{courseId}/reviews")
@Log4j2
public class CourseReviewController {

    private final ReviewServiceImpl reviewService;

    @PostMapping("/create")
    @Operation(summary = "Course Review 생성")
    public ResponseEntity<ReviewDTO> create(@RequestBody ReviewDTO reviewDTO) {
        System.out.println(reviewDTO.getWriterId());

        log.info("Create review: " + reviewDTO);

        return ResponseEntity.ok(reviewService.createReview(reviewDTO, ReviewType.COURSE));
    }


    @PutMapping("/{reviewId}")
    @Operation(summary = "Course Review 수정")
    public ResponseEntity<ReviewDTO> update(@PathVariable("reviewId") Long reviewId, @RequestBody ReviewDTO reviewDTO) {

        log.info("update Review: " + reviewDTO);
        return ResponseEntity.ok(reviewService.updateReview(reviewId, reviewDTO));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Course Review 삭제")
    public ResponseEntity<Map<String, String>> remove(@PathVariable("reviewId") Long reviewId, @RequestBody ReviewDTO reviewDTO) {

        log.info("Delete Review: " + reviewId);
        log.info(reviewDTO.getWriterId());

        reviewService.deleteReview(reviewId, reviewDTO);
        return ResponseEntity.ok(Map.of("result", "success"));
    }

    @GetMapping("/list")
    @Operation(summary = "Course Review list 조회")
    public ResponseEntity<List<ReviewDTO>> reviewList(@PathVariable("courseId") Long courseId,
                                      ReviewDTO reviewDTO) {

        return ResponseEntity.ok(reviewService.getCourseReviewList(courseId, reviewDTO));
    }
}
