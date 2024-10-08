package edu.example.learner.qna.answer.repository;

import edu.example.learner.qna.answer.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Query("select a from Answer a where a.inquiry.inquiryId = :inquiryId")
    Optional<Answer> findByInquiryId(@Param("inquiryId") Long inquiryId);

    @Modifying
    @Transactional
    @Query("delete from Answer a where a.inquiry.inquiryId = :inquiryId")
    void deleteByInquiryId(@Param("inquiryId") Long inquiryId);
}
