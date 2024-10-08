package edu.example.learner.courseabout.video.controller;

import edu.example.learner.courseabout.video.dto.VideoDTO;
import edu.example.learner.courseabout.video.entity.Video;
import edu.example.learner.courseabout.video.repository.VideoRepository;
import edu.example.learner.courseabout.video.service.VideoService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/video")
@RequiredArgsConstructor
@Tag(name = "비디오 컨트롤러", description = "비디오 CRUD를 담당하는 컨트롤러입니다.")
public class VideoController {
    private final VideoService videoService;
    private final VideoRepository videoRepository;

    private double totalDuration = 0; // 전체 동영상 시간
    private double currentTime = 0; // 현재 재생 시간

    @PostMapping("/savePlayTime")
    @Operation(summary = "재생 시간 저장", description = "비디오 ID와 재생 시간을 저장합니다.")
    public String savePlayTime(@Parameter(description = "재생 시간 요청 데이터") @RequestBody PlayTimeRequest playTimeRequest) {
        Long videoId = playTimeRequest.getVideoId();

        Optional<VideoDTO> videoById = videoService.getVideoById(videoId);
        if (videoById.isPresent()) {
            Video video = videoById.get().toEntity();

            if (playTimeRequest.getTotalDuration() > 0) {
                video.setTotalVideoDuration((long) playTimeRequest.getTotalDuration()); // 전체 동영상 시간 업데이트
                System.out.println("전체 동영상 시간: " + video.getTotalVideoDuration() + "초");
            } else {
                video.setCurrentVideoTime((long) playTimeRequest.getCurrentTime()); // 현재 재생 시간 업데이트
                System.out.println("현재 동영상 재생 시간: " + video.getCurrentVideoTime() + "초");
            }

            videoRepository.save(video); // 변경 사항 저장
            return "시간 저장 완료";
        } else {
            return "비디오를 찾을 수 없습니다.";
        }
    }

    @GetMapping("/videoInfo")
    @Operation(summary = "비디오 정보 조회", description = "전체 동영상 시간과 현재 재생 시간을 조회합니다.")
    public ResponseEntity<VideoInfo> getVideoInfo() {
        VideoInfo videoInfo = new VideoInfo(totalDuration, currentTime);
        return ResponseEntity.ok(videoInfo);
    }

    @GetMapping("/list/admin")
    @Operation(summary = "모든 비디오 조회", description = "관리자가 모든 비디오 목록을 조회합니다.")
    public ResponseEntity<List<VideoDTO>> getAllVideos() {
        List<VideoDTO> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "비디오 조회", description = "특정 ID의 비디오를 조회합니다.")
    public ResponseEntity<VideoDTO> getVideoById(@Parameter(description = "조회할 비디오 ID") @PathVariable Long id) {
        return videoService.getVideoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "비디오 추가", description = "새로운 비디오를 추가합니다.")
    public ResponseEntity<VideoDTO> addVideo(@Parameter(description = "추가할 비디오 데이터") @RequestBody VideoDTO videoDTO) {
        VideoDTO createdVideo = videoService.addVideo(videoDTO);
        return ResponseEntity.status(201).body(createdVideo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "비디오 수정", description = "특정 ID의 비디오 정보를 수정합니다.")
    public ResponseEntity<VideoDTO> updateVideo(@Parameter(description = "수정할 비디오 ID") @PathVariable Long id, @Parameter(description = "수정할 비디오 데이터") @RequestBody VideoDTO videoDTO) {
        return videoService.updateVideo(id, videoDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "비디오 삭제", description = "특정 ID의 비디오를 삭제합니다.")
    public ResponseEntity<Void> deleteVideo(@Parameter(description = "삭제할 비디오 ID") @PathVariable Long id) {
        boolean isDeleted = videoService.deleteVideo(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @Getter
    @Setter
    public static class PlayTimeRequest {
        private double totalDuration;
        private double currentTime;
        private Long videoId;
    }

    public static class VideoInfo {
        private double totalDuration;
        private double currentTime;

        public VideoInfo(double totalDuration, double currentTime) {
            this.totalDuration = totalDuration;
            this.currentTime = currentTime;
        }

        public double getTotalDuration() {
            return totalDuration;
        }

        public double getCurrentTime() {
            return currentTime;
        }
    }
}
