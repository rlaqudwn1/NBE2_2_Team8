package edu.example.learner.qna.inquiry.service;

import edu.example.learner.qna.inquiry.entity.InquiryStatus;
import edu.example.learner.qna.inquiry.repository.InquiryRepository;
import edu.example.learner.member.exception.LearnerException;
import edu.example.learner.qna.inquiry.dto.InquiryDTO;
import edu.example.learner.qna.inquiry.entity.Inquiry;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class InquiryServiceImpl implements InquiryService {
    private final InquiryRepository inquiryRepository;

    @Override
    public InquiryDTO read(Long inquiryId) {
        return new InquiryDTO(inquiryRepository.findById(inquiryId).orElseThrow(LearnerException.NOT_FOUND_EXCEPTION::getTaskException));
    }

    @Override
    public List<InquiryDTO> readByMemberId(Long memberId) {
        return inquiryRepository.findByMemberId(memberId).stream().map(InquiryDTO::new).collect(Collectors.toList());
    }

    @Override
    public List<InquiryDTO> readAll() {
        return inquiryRepository.findAll().stream().map(InquiryDTO::new).collect(Collectors.toList());
    }

    @Override
    public InquiryDTO register(InquiryDTO inquiryDTO) {
        try {
            Inquiry savedInquiry = inquiryRepository.save(inquiryDTO.toEntity());
            return new InquiryDTO(savedInquiry);
        } catch (Exception e) {
            log.error(e);
            throw LearnerException.NOT_REGISTERED_EXCEPTION.getTaskException();
        }
    }

    @Override
    public InquiryDTO update(InquiryDTO inquiryDTO) {
        Inquiry inquiry = inquiryRepository.findById(inquiryDTO.getInquiryId()).orElseThrow(LearnerException.NOT_FOUND_EXCEPTION::getTaskException);
        try {
            inquiry.changeInquiryTitle(inquiryDTO.getInquiryTitle());
            inquiry.changeInquiryContent(inquiryDTO.getInquiryContent());
            inquiry.changeInquiryStatus(InquiryStatus.valueOf(inquiryDTO.getInquiryStatus()));
            return new InquiryDTO(inquiry);
        } catch (Exception e) {
            log.error(e);
            throw LearnerException.NOT_MODIFIED_EXCEPTION.getTaskException();
        }
    }

    @Override
    public void delete(Long inquiryId) {
        inquiryRepository.findById(inquiryId).orElseThrow(LearnerException.NOT_FOUND_EXCEPTION::getTaskException);
        try {
            inquiryRepository.deleteById(inquiryId);
        } catch (Exception e) {
            log.error(e);
            throw LearnerException.NOT_REMOVED_EXCEPTION.getTaskException();
        }
    }
}
