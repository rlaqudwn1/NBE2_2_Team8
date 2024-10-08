package edu.example.learner.courseabout.course.repository;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.courseabout.course.entity.MemberCourse;
import edu.example.learner.courseabout.course.repository.search.MemberCourseSearch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberCourseRepository extends JpaRepository<MemberCourse, Long> , MemberCourseSearch {
    List<MemberCourse> findByMember_MemberId(Long memberId);
    boolean existsByMember_MemberIdAndCourse_CourseId(Long memberId, Long courseId);
}
