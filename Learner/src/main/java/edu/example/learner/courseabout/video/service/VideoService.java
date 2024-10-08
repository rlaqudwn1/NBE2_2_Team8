package edu.example.learner.courseabout.video.service;

import edu.example.learner.courseabout.video.dto.VideoDTO;
import edu.example.learner.courseabout.video.entity.Video;
import edu.example.learner.courseabout.video.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
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
        Video video = videoDTO.toEntity();
        Video savedVideo = videoRepository.save(video);
        return new VideoDTO(savedVideo);
    }

    // 비디오 정보를 업데이트합니다.
    @Transactional
    public Optional<VideoDTO> updateVideo(Long id, VideoDTO videoDTO) {
        return videoRepository.findById(id).map(video -> {
            video.changeTitle(videoDTO.getTitle());
            video.changeUrl(videoDTO.getUrl());
            video.changeDescription(videoDTO.getDescription());
            video.initializeTimes(videoDTO.getTotalVideoDuration(), videoDTO.getCurrentVideoTime());
            Video updatedVideo = videoRepository.save(video);
            return new VideoDTO(updatedVideo);
        });
    }

    // 비디오를 삭제합니다.
    @Transactional
    public boolean deleteVideo(Long id) {
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
