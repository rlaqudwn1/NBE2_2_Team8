package edu.example.learner.courseabout.video.entity;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Setter
@Getter
@ToString(exclude = "course")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long video_Id;

    private String title;

    private String url;

    private String description;

    private Long totalVideoDuration; // 전체 동영상 시간 추가
    private Long currentVideoTime;   // 현재 동영상 시간 추가

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_Id", referencedColumnName = "course_id") // course_id에 맞추기
    private Course course;

    // Getters and changeters

    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeUrl(String url) {
        this.url = url;
    }

    public void changeDescription(String description) {
        this.description = description;
    }

    // 초기 동영상 시간 설정 메서드
    public void initializeTimes(Long totalDuration, Long currentTime) {
        this.totalVideoDuration = totalDuration;
        this.currentVideoTime = currentTime;
    }
}
