package edu.example.learner.courseabout.video.service;

import edu.example.learner.courseabout.exception.VideoException;
import edu.example.learner.courseabout.video.dto.VideoDTO;
import edu.example.learner.courseabout.video.entity.Video;
import edu.example.learner.courseabout.video.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class VideoService {

    private final VideoRepository videoRepository;

    // 모든 비디오를 가져옵니다.
    public List<VideoDTO> getAllVideos() {
        List<Video> videos = videoRepository.findAll();
        return videos.stream().map(VideoDTO::new).toList(); // DTO 변환
    }

    // 특정 ID의 비디오를 가져옵니다.
    public Optional<VideoDTO> getVideoById(Long id) {
        return videoRepository.findById(id).map(VideoDTO::new);
    }

    // 비디오를 추가합니다.
    @Transactional // 트랜잭션 관리
    public VideoDTO addVideo(VideoDTO videoDTO) {
        log.info("Adding video: " + videoDTO);
        Video video = videoDTO.toEntity();
        Video savedVideo = videoRepository.save(video);
        log.info("Add success {}", savedVideo);
        return new VideoDTO(savedVideo);
    }

    // 비디오 정보를 업데이트합니다.
    @Transactional
    public VideoDTO updateVideo(Long id, VideoDTO videoDTO) {
        log.info("update video with Id {}", id);
        Video video = videoRepository.findById(id).orElseThrow(VideoException.VIDEO_NOT_FOUND::get);

        log.info("Current Video details: {}", video);
        log.info("Update Video details: {}", videoDTO);

        video.setTitle(videoDTO.getTitle());
        video.setDescription(videoDTO.getDescription());
        video.changeUrl(videoDTO.getUrl());
        video.initializeTimes(videoDTO.getTotalVideoDuration(),videoDTO.getCurrentVideoTime());
        Video savedVideo = videoRepository.save(video);
        log.info("Video Update success: {}", savedVideo);
        return new VideoDTO(savedVideo);
    }

    // 비디오를 삭제합니다.
    @Transactional
    public boolean deleteVideo(Long id) {
        log.info("Deleting video with Id {}", id);
        if (videoRepository.existsById(id)) {
            videoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // 특정 강좌에 속한 비디오를 가져옵니다.
    public List<VideoDTO> getVideosByCourseId(Long courseId) {
        List<Video> videos = videoRepository.findByCourse_CourseId(courseId);
        return videos.stream().map(VideoDTO::new).toList(); // DTO 변환
    }
}
