package edu.example.learner.qna.answer.service;

import edu.example.learner.qna.answer.dto.AnswerDTO;
import edu.example.learner.qna.answer.entity.Answer;
import edu.example.learner.qna.answer.repository.AnswerRepository;
import edu.example.learner.member.exception.LearnerException;
import edu.example.learner.qna.inquiry.repository.InquiryRepository;
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
public class AnswerServiceImpl implements AnswerService {
    private final AnswerRepository answerRepository;
    private final InquiryRepository inquiryRepository;

    @Override
    public AnswerDTO read(Long inquiryId) {
        return new AnswerDTO(answerRepository.findByInquiryId(inquiryId).orElseThrow(LearnerException.NOT_FOUND_EXCEPTION::getTaskException));
    }

    @Override
    public List<AnswerDTO> readAll() {
        return answerRepository.findAll().stream().map(AnswerDTO::new).collect(Collectors.toList());
    }

    @Override
    public AnswerDTO register(AnswerDTO answerDTO) {
        try {
            Answer savedAnswer = answerRepository.save(answerDTO.toEntity());
            return new AnswerDTO(savedAnswer);
        } catch (Exception e) {
            log.error(e);
            throw LearnerException.NOT_REGISTERED_EXCEPTION.getTaskException();
        }
    }

    @Override
    public AnswerDTO update(AnswerDTO answerDTO) {
        Answer answer = answerRepository.findById(answerDTO.getAnswerId()).orElseThrow();
        try {
            answer.changeAnswerContent(answerDTO.getAnswerContent());
            return new AnswerDTO(answer);
        } catch (Exception e) {
            log.error(e);
            throw LearnerException.NOT_MODIFIED_EXCEPTION.getTaskException();
        }
    }

    @Override
    public void delete(Long answerId) {
        answerRepository.findById(answerId).orElseThrow(LearnerException.NOT_FOUND_EXCEPTION::getTaskException);
        try {
            answerRepository.deleteById(answerId);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw LearnerException.NOT_REMOVED_EXCEPTION.getTaskException();
        }
    }

    @Override
    public void deleteByInquiryId(Long inquiryId) {
        answerRepository.findByInquiryId(inquiryId).orElseThrow(LearnerException.NOT_FOUND_EXCEPTION::getTaskException);
        try {
            answerRepository.deleteByInquiryId(inquiryId);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw LearnerException.NOT_REMOVED_EXCEPTION.getTaskException();
        }
    }
}
