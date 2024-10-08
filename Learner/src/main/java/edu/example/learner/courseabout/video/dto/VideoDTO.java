package edu.example.learner.courseabout.video.dto;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.courseabout.video.entity.Video;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class VideoDTO {

    private Long video_Id;

    private Long course_Id;

    private String title;

    private String url;

    private String description;

    private Long totalVideoDuration; // 전체 동영상 시간 추가
    private Long currentVideoTime;   // 현재 동영상 시간 추가

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public VideoDTO(Video video) {
        this.video_Id = video.getVideo_Id();
        this.course_Id = video.getCourse().getCourseId();
        this.title = video.getTitle();
        this.url = video.getUrl();
        this.description = video.getDescription();
        this.totalVideoDuration = video.getTotalVideoDuration();
        this.currentVideoTime = video.getCurrentVideoTime();
        this.createdAt = video.getCreatedAt();
        this.updatedAt = video.getUpdatedAt();
    }
    public Video toEntity() {
        return Video.builder()
                .video_Id(this.video_Id)
                .title(this.title)
                .course(Course.builder().courseId(this.course_Id).build())
                .currentVideoTime(this.currentVideoTime)
                .url(this.url)
                .totalVideoDuration(this.totalVideoDuration)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .description(this.description)
                .build();
    }

}
