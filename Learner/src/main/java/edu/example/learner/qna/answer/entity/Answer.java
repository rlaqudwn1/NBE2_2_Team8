package edu.example.learner.qna.answer.entity;

import edu.example.learner.qna.inquiry.entity.Inquiry;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "answer")
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    private String answerContent;

    @CreatedDate
    private LocalDateTime answerCreateDate;

    @OneToOne
    @JoinColumn(name = "inquiry_id", nullable = false)
    private Inquiry inquiry;

    public void changeAnswerContent(String answerContent) {
        this.answerContent = answerContent;
    }
}
