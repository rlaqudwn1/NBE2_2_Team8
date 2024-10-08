package edu.example.learner.qna.inquiry.repository;

import edu.example.learner.qna.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    @Query("select i from Inquiry i where i.member.memberId = :memberId")
    List<Inquiry> findByMemberId(@Param("memberId") Long memberId);
}
