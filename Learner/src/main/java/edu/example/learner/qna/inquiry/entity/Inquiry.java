package edu.example.learner.qna.inquiry.entity;

import edu.example.learner.member.entity.Member;
import edu.example.learner.qna.answer.entity.Answer;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry")
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inquiryId;

    private String inquiryTitle;

    private String inquiryContent;

    @CreatedDate
    private LocalDateTime inquiryCreateDate;

    @LastModifiedDate
    private LocalDateTime inquiryUpdateDate;

    @Enumerated(EnumType.STRING)
    private InquiryStatus inquiryStatus;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    private Answer answer;

    public void changeInquiryTitle(String inquiryTitle) {
        this.inquiryTitle = inquiryTitle;
    }

    public void changeInquiryContent(String inquiryContent) {
        this.inquiryContent = inquiryContent;
    }

    public void changeInquiryStatus(InquiryStatus inquiryStatus) {
        this.inquiryStatus = inquiryStatus;
    }
}
