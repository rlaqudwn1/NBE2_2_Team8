package edu.example.learner.qna.inquiry.service;

import edu.example.learner.qna.inquiry.dto.InquiryDTO;

import java.util.List;

public interface InquiryService {
    InquiryDTO read(Long inquiryId);

    List<InquiryDTO> readByMemberId(Long memberId);

    List<InquiryDTO> readAll();

    InquiryDTO register(InquiryDTO inquiryDTO);

    InquiryDTO update(InquiryDTO inquiryDTO);

    void delete(Long inquiryId);
}
