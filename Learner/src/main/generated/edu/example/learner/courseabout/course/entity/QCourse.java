package edu.example.learner.courseabout.course.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCourse is a Querydsl query type for Course
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCourse extends EntityPathBase<Course> {

    private static final long serialVersionUID = 764815304L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCourse course = new QCourse("course");

    public final EnumPath<CourseAttribute> courseAttribute = createEnum("courseAttribute", CourseAttribute.class);

    public final DateTimePath<java.time.LocalDateTime> courseCreatedDate = createDateTime("courseCreatedDate", java.time.LocalDateTime.class);

    public final StringPath courseDescription = createString("courseDescription");

    public final NumberPath<Long> courseId = createNumber("courseId", Long.class);

    public final NumberPath<Integer> courseLevel = createNumber("courseLevel", Integer.class);

    public final DateTimePath<java.time.LocalDateTime> courseModifiedDate = createDateTime("courseModifiedDate", java.time.LocalDateTime.class);

    public final StringPath courseName = createString("courseName");

    public final NumberPath<Long> coursePrice = createNumber("coursePrice", Long.class);

    public final edu.example.learner.member.entity.QMember instructorName;

    public final ListPath<edu.example.learner.courseabout.news.entity.NewsEntity, edu.example.learner.courseabout.news.entity.QNewsEntity> newsEntities = this.<edu.example.learner.courseabout.news.entity.NewsEntity, edu.example.learner.courseabout.news.entity.QNewsEntity>createList("newsEntities", edu.example.learner.courseabout.news.entity.NewsEntity.class, edu.example.learner.courseabout.news.entity.QNewsEntity.class, PathInits.DIRECT2);

    public final BooleanPath sale = createBoolean("sale");

    public final ListPath<edu.example.learner.courseabout.video.entity.Video, edu.example.learner.courseabout.video.entity.QVideo> videos = this.<edu.example.learner.courseabout.video.entity.Video, edu.example.learner.courseabout.video.entity.QVideo>createList("videos", edu.example.learner.courseabout.video.entity.Video.class, edu.example.learner.courseabout.video.entity.QVideo.class, PathInits.DIRECT2);

    public QCourse(String variable) {
        this(Course.class, forVariable(variable), INITS);
    }

    public QCourse(Path<? extends Course> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCourse(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCourse(PathMetadata metadata, PathInits inits) {
        this(Course.class, metadata, inits);
    }

    public QCourse(Class<? extends Course> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.instructorName = inits.isInitialized("instructorName") ? new edu.example.learner.member.entity.QMember(forProperty("instructorName")) : null;
    }

}
