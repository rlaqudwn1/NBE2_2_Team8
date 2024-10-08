package edu.example.learner.qna.inquiry.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QInquiry is a Querydsl query type for Inquiry
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QInquiry extends EntityPathBase<Inquiry> {

    private static final long serialVersionUID = -99263674L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QInquiry inquiry = new QInquiry("inquiry");

    public final edu.example.learner.qna.answer.entity.QAnswer answer;

    public final StringPath inquiryContent = createString("inquiryContent");

    public final DateTimePath<java.time.LocalDateTime> inquiryCreateDate = createDateTime("inquiryCreateDate", java.time.LocalDateTime.class);

    public final NumberPath<Long> inquiryId = createNumber("inquiryId", Long.class);

    public final EnumPath<InquiryStatus> inquiryStatus = createEnum("inquiryStatus", InquiryStatus.class);

    public final StringPath inquiryTitle = createString("inquiryTitle");

    public final DateTimePath<java.time.LocalDateTime> inquiryUpdateDate = createDateTime("inquiryUpdateDate", java.time.LocalDateTime.class);

    public final edu.example.learner.member.entity.QMember member;

    public QInquiry(String variable) {
        this(Inquiry.class, forVariable(variable), INITS);
    }

    public QInquiry(Path<? extends Inquiry> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QInquiry(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QInquiry(PathMetadata metadata, PathInits inits) {
        this(Inquiry.class, metadata, inits);
    }

    public QInquiry(Class<? extends Inquiry> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.answer = inits.isInitialized("answer") ? new edu.example.learner.qna.answer.entity.QAnswer(forProperty("answer"), inits.get("answer")) : null;
        this.member = inits.isInitialized("member") ? new edu.example.learner.member.entity.QMember(forProperty("member")) : null;
    }

}

