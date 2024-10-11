package edu.example.learner.alarm.entity;

import edu.example.learner.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


@Embeddable
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
@Entity(name = "alarm")
public class Alarm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alarmId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private String alarmContent;

    private String alarmTitle;
    @Enumerated(EnumType.STRING)
    private AlarmType alarmType;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @CreatedDate
    private LocalDateTime createdAt;

    private boolean alarmStatus;

    // change
    public void changeAlarmTitle(String title){
        this.alarmTitle = title;
    }
    public void changeAlarmType(AlarmType type){
        this.alarmType = type;
    }
    public void changePriority(Priority priority){
        this.priority = priority;
    }
    public void changeContent(String content){
        this.alarmContent = content;
    }
    public void changeAlarmStatus(boolean status){
        this.alarmStatus = status;
    }

}
