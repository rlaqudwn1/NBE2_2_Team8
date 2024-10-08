package edu.example.learner.qna.answer.service;

import edu.example.learner.qna.answer.dto.AnswerDTO;

import java.util.List;

public interface AnswerService {
    AnswerDTO read(Long answerId);

    List<AnswerDTO> readAll();

    AnswerDTO register(AnswerDTO answerDTO);

    AnswerDTO update(AnswerDTO answerDTO);

    void delete(Long answerId);

    void deleteByInquiryId(Long inquiryId);
}
