package edu.example.learner.qna.inquiry.dto;

import edu.example.learner.qna.inquiry.entity.Inquiry;
import edu.example.learner.qna.inquiry.entity.InquiryStatus;
import edu.example.learner.member.entity.Member;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDTO {
    private Long inquiryId;

    @NotEmpty
    private String inquiryTitle;

    @NotEmpty
    private String inquiryContent;

    private LocalDateTime inquiryCreateDate;

    private LocalDateTime inquiryUpdateDate;

    @Builder.Default
    private String inquiryStatus = InquiryStatus.CONFIRMING.name();

    @NotNull
    private Long memberId;

    private String memberNickname;

    public InquiryDTO(Inquiry inquiry) {
        this.inquiryId = inquiry.getInquiryId();
        this.inquiryTitle = inquiry.getInquiryTitle();
        this.inquiryContent = inquiry.getInquiryContent();
        this.inquiryCreateDate = inquiry.getInquiryCreateDate();
        this.inquiryUpdateDate = inquiry.getInquiryUpdateDate();
        this.inquiryStatus = inquiry.getInquiryStatus().name();
        this.memberId = inquiry.getMember().getMemberId();
        this.memberNickname = inquiry.getMember().getNickname();
    }

    public Inquiry toEntity() {
        return Inquiry.builder()
                .inquiryId(inquiryId)
                .inquiryTitle(inquiryTitle)
                .inquiryContent(inquiryContent)
                .inquiryCreateDate(inquiryCreateDate)
                .inquiryUpdateDate(inquiryUpdateDate)
                .inquiryStatus(InquiryStatus.valueOf(inquiryStatus))
                .member(Member.builder().memberId(memberId).build())
                .build();
    }
}
