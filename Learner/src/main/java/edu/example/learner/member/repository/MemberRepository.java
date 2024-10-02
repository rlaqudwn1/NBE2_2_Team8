package edu.example.learner.member.repository;

import edu.example.learner.member.entity.Member;
import edu.example.learner.member.repository.search.MemberSearch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Integer>, MemberSearch {
    @Override
    Member getMemberInfo(Long id);

    @Override
    List<Member> getAllMembers();
}