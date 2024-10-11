package edu.example.learner.courseabout.course.service;

import edu.example.learner.courseabout.course.dto.CourseDTO;
import edu.example.learner.courseabout.course.dto.MemberCourseDTO;
import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.courseabout.course.entity.CourseAttribute;
import edu.example.learner.courseabout.course.entity.MemberCourse;
import edu.example.learner.courseabout.course.repository.CourseRepository;
import edu.example.learner.courseabout.course.repository.MemberCourseRepository;
import edu.example.learner.courseabout.exception.CourseException;
import edu.example.learner.member.entity.Member;
import edu.example.learner.member.exception.MemberException;
import edu.example.learner.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;



@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final MemberCourseRepository memberCourseRepository;
    private final MemberRepository memberRepository;

    @Override
    public CourseDTO addCourse(CourseDTO courseDTO) {
        log.info("add course");
        try {
            Optional<Member> findMember = memberRepository.getMemberByNickName(courseDTO.getMemberNickname());
            if(findMember.isPresent()) {
                Member member = findMember.get  ();

                log.info("member: {}", member);

                Course course = Course.builder()
                        .courseName(courseDTO.getCourseName())
                        .courseDescription(courseDTO.getCourseDescription())
                        .coursePrice(courseDTO.getCoursePrice())
                        .courseLevel(courseDTO.getCourseLevel())
                        .member(member)
                        .courseAttribute(CourseAttribute.ETC)
                        .sale(false)
                        .build();
                courseRepository.save(course);
            } else {
                 throw MemberException.MEMBER_NOT_FOUND.getMemberTaskException();
            }
        }catch (Exception e){
            throw CourseException.COURSE_ADD_FAILED.getCourseException();
        }

        log.info("successfully added course ");

       return courseDTO;
    }

    @Override
    public CourseDTO read(Long courseId) {
        try {
            Course course = courseRepository.findById(courseId).orElseThrow(CourseException.COURSE_NOT_FOUND::getCourseException);
            log.info("course: {}", course);
            return new CourseDTO(course);
        }catch (Exception e){
            log.error("Error adding course: ", e);
            throw CourseException.COURSE_ADD_FAILED.getCourseException();
        }
    }

    @Override
    public List<CourseDTO> readByAttribute(CourseAttribute courseAttribute) {
        try {
            List<Course> courseList = courseRepository.readByCourseAttribute(courseAttribute);
            List<CourseDTO> courseDTOList = new ArrayList<>();
            for (Course course : courseList) {
                courseDTOList.add(new CourseDTO(course));
            }
            log.info("successfully read course list");
            return courseDTOList;
        }catch (Exception e){
            log.error("Error reading course By Attribute: ", e);
            throw CourseException.COURSE_NOT_FOUND.getCourseException();
        }
    }

    @Override
    @Transactional
    public CourseDTO readReview(Long courseId) {
        Course course = courseRepository.findByIdWithMember(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return new CourseDTO(course);
    }

    @Override
    public CourseDTO updateCourse(CourseDTO courseDTO) {
        Optional<Course> findCourse = courseRepository.findById(courseDTO.getCourseId());

        if (findCourse.isPresent()) {
            Course course = findCourse.get();
            try {
                course.changeCourseLevel(courseDTO.getCourseLevel());
                course.changeCourseName(courseDTO.getCourseName());
                course.changeCourseDescription(courseDTO.getCourseDescription());
                course.changePrice(courseDTO.getCoursePrice());  // 가격 수정 추가
                if(courseDTO.getCourseAttribute() != null){
                    course.changeCourseStatus(CourseAttribute.valueOf(courseDTO.getCourseAttribute()));
                }
                log.info("저장된 데이터 확인 : " + courseRepository.findById(courseDTO.getCourseId()).get().getCoursePrice());
            } catch (Exception e) {
                log.error("Error updating course: ", e);
                throw CourseException.COURSE_NOT_MODIFIED.getCourseException();
            }
        } else {
            throw CourseException.MEMBER_COURSE_NOT_FOUND.getCourseException();
        }
        return courseDTO;
    }



    @Override
    public void deleteCourse(Long courseId) {
        try {
            courseRepository.deleteById(courseId);
        }
        catch (Exception e){
            log.error("Error deleting course: ", e);
            log.error("courseId: {}", courseId);
            throw CourseException.COURSE_NOT_DELETED.getCourseException();
        }
    }

    @Override
    public List<CourseDTO> readAll() {
        List<Course> courseList = courseRepository.findAll();

        List<CourseDTO> courseDTOList = new ArrayList<>();
        for (Course course : courseList) {
            courseDTOList.add(new CourseDTO(course));
        }
        return courseDTOList;
    }

    @Override
    public List<CourseDTO> getCoursesByNickname(String nickname) {
        List<Course> byMemberNickname = courseRepository.getByMemberNickname(nickname);
        if (byMemberNickname != null && !byMemberNickname.isEmpty()) {
            List<CourseDTO> courseDTOList = new ArrayList<>();
            for (Course course : byMemberNickname) {
                courseDTOList.add(new CourseDTO(course));
            }
            return courseDTOList;
        } else {
            return new ArrayList<>(); // 빈 리스트 반환
        }
    }

    //수강 중인 강의 목록
    @Override
    public List<MemberCourseDTO> getMemberCoursesByMemberId(Long memberId) {
        List<MemberCourse> memberCourseList = memberCourseRepository.getMemberCourse(memberId);
        try {
            if (memberCourseList == null && memberCourseList.isEmpty()) {
                throw CourseException.MEMBER_COURSE_NOT_FOUND.getCourseException();
            }

            List<MemberCourseDTO> memberCourseDTOList = new ArrayList<>();

            for (MemberCourse memberCourse : memberCourseList) {
                memberCourseDTOList.add(new MemberCourseDTO(memberCourse));
            }
            log.info(memberCourseDTOList);
            return memberCourseDTOList;
        }catch (Exception e){
            log.error("Error reading member course: ", e);
            throw CourseException.COURSE_NOT_FOUND.getCourseException();
        }

    }

    @Override
    public List<CourseDTO> getCoursesByMemberId(Long memberId) {

        try {
            log.info("memberId: {}", memberId);
            List<MemberCourse> memberCourses = memberCourseRepository.findByMember_MemberId(memberId);
            log.info("강의 개수 {}",memberCourses.size());

            if (memberCourses == null || memberCourses.isEmpty()) {
                throw CourseException.MEMBER_COURSE_NOT_FOUND.getCourseException();
            }

            List<CourseDTO> courseDTOList = new ArrayList<>();
            for (MemberCourse memberCourse : memberCourses) {
                courseDTOList.add(new CourseDTO(memberCourse.getCourse()));
            }
            return courseDTOList;
        }catch (Exception e){
            log.error("Error reading course By Member: ", e);
            throw CourseException.COURSE_NOT_FOUND.getCourseException();
        }

    }

    // 강사 닉네임 반환
    public String getInstructorNicknameByCourseId(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("해당 코스를 찾을 수 없습니다."));

        // 해당 코스의 Member(강사)의 닉네임을 반환
        return course.getMember().getNickname();
    }

}
