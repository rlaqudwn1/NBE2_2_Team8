package edu.example.learner.courseabout.course.controller;

import edu.example.learner.courseabout.course.dto.CourseDTO;
import edu.example.learner.courseabout.course.dto.MemberCourseDTO;
import edu.example.learner.courseabout.course.service.CourseService;
import edu.example.learner.courseabout.course.service.CourseServiceImpl;
import edu.example.learner.member.dto.MemberDTO;
import edu.example.learner.member.service.MemberService;
import edu.example.learner.courseabout.video.dto.VideoDTO;
import edu.example.learner.courseabout.video.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;
import java.util.Map;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/course")
@Tag(name = "강의 관리", description = "강의 CRUD 및 관련 작업을 수행합니다.")
public class CourseController {
    private final CourseService courseService;
    private final CourseServiceImpl courseServiceImpl;
    private final VideoService videoService;

    @PostMapping()
    @Operation(summary = "강의 생성", description = "새로운 강의를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "강의가 성공적으로 생성되었습니다."),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        log.info("Creating course {}", courseDTO);
        return ResponseEntity.ok(courseService.addCourse(courseDTO));
    }

    @GetMapping("/{courseId}")
    @Operation(summary = "강의 조회", description = "강의 ID로 특정 강의를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "강의가 성공적으로 조회되었습니다."),
            @ApiResponse(responseCode = "404", description = "강의를 찾을 수 없습니다.")
    })
    public ResponseEntity<CourseDTO> readCourse(@PathVariable Long courseId) {
        log.info("Reading course {}", courseId);
        CourseDTO courseDTO = courseService.read(courseId);
        return ResponseEntity.ok(courseDTO);
    }

    @GetMapping("/list")
    @Operation(summary = "모든 강의 목록 조회", description = "모든 강의의 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "모든 강의 목록이 성공적으로 조회되었습니다.")
    })
    public ResponseEntity<List<CourseDTO>> readCourseList() {
        log.info("Reading all course list");
        return ResponseEntity.ok(courseService.readAll());
    }

    @GetMapping("/video/{courseId}")
    @Operation(summary = "강의의 비디오 목록 조회", description = "강의 ID로 해당 강의에 포함된 비디오 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "비디오 목록이 성공적으로 조회되었습니다."),
            @ApiResponse(responseCode = "404", description = "강의를 찾을 수 없습니다.")
    })
    public ResponseEntity<List<VideoDTO>> getVideosByCourseId(@PathVariable Long courseId) {
        List<VideoDTO> videos = videoService.getVideosByCourseId(courseId);
        return ResponseEntity.ok(videos);
    }

    @PutMapping("")
    @Operation(summary = "강의 수정", description = "기존 강의를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "강의가 성공적으로 수정되었습니다."),
            @ApiResponse(responseCode = "404", description = "강의를 찾을 수 없습니다.")
    })
    public ResponseEntity<CourseDTO> updateCourse(@RequestBody CourseDTO courseDTO) {
        log.info("Updating course {}", courseDTO);
        return ResponseEntity.ok(courseService.updateCourse(courseDTO));
    }

    @DeleteMapping("/{courseId}")
    @Operation(summary = "강의 삭제", description = "강의 ID로 특정 강의를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "강의가 성공적으로 삭제되었습니다."),
            @ApiResponse(responseCode = "404", description = "강의를 찾을 수 없습니다.")
    })
    public ResponseEntity<?> deleteCourse(@PathVariable Long courseId) {
        log.info("Deleting course {}", courseId);
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok(Map.of("delete", "success"));
    }

    @GetMapping("{memberId}/list")
    @Operation(summary = "내 수강 정보 조회", description = "회원 ID로 해당 회원의 수강 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수강 정보가 성공적으로 조회되었습니다."),
            @ApiResponse(responseCode = "404", description = "회원 정보를 찾을 수 없습니다.")
    })
    public ResponseEntity<List<MemberCourseDTO>> readCourseListByMemberId(@PathVariable Long memberId) {
        log.info("Reading course list for member {}", memberId);
        return ResponseEntity.ok(courseService.getMemberCoursesByMemberId(memberId));
    }

    @GetMapping("/{courseId}/member-nickname")
    @Operation(summary = "코스의 강사 닉네임 조회", description = "코스의 강사 닉네임을 조회합니다.")
    public ResponseEntity<String> getCourseInstructorNickname(@PathVariable Long courseId) {
        String instructorNickname = courseServiceImpl.getInstructorNicknameByCourseId(courseId);

        if (instructorNickname != null) {
            return ResponseEntity.ok(instructorNickname);  // 닉네임을 성공적으로 반환
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 코스 또는 닉네임을 찾을 수 없습니다.");
        }
    }
}
