package edu.example.learner.courseabout.order.service;

import edu.example.learner.courseabout.course.entity.MemberCourse;
import edu.example.learner.courseabout.course.repository.MemberCourseRepository;
import edu.example.learner.courseabout.exception.CourseException;
import edu.example.learner.courseabout.order.dto.OrderDTO;
import edu.example.learner.courseabout.order.dto.OrderItemDTO;
import edu.example.learner.courseabout.order.dto.OrderUpdateDTO;
import edu.example.learner.courseabout.order.exception.OrderException;
import edu.example.learner.courseabout.order.exception.OrderTaskException;
import edu.example.learner.courseabout.order.repository.OrderItemRepository;
import edu.example.learner.courseabout.order.repository.OrderRepository;

import edu.example.learner.courseabout.course.entity.Course;
import edu.example.learner.courseabout.order.entity.Order;
import edu.example.learner.courseabout.order.entity.OrderItem;
import edu.example.learner.courseabout.order.entity.OrderStatus;

import edu.example.learner.courseabout.course.repository.CourseRepository;
import edu.example.learner.member.entity.Member;
import edu.example.learner.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.antlr.v4.runtime.atn.SemanticContext;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.HandlerMapping;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final CourseRepository courseRepository;
    private final OrderItemRepository orderItemRepository;
    private final MemberRepository memberRepository;
    private final MemberCourseRepository memberCourseRepository;

    @Override
    public OrderDTO purchaseOrderItems(Long orderId, Long memberId) {
        // 주문 찾기
        Order order = orderRepository.findById(orderId)
                .orElseThrow(OrderException.ORDER_NOT_FOUND::get);

        // 주문자 확인
        if (!order.getMember().getMemberId().equals(memberId)) {
            throw OrderException.ORDER_NOT_FOUND.get();
        }

        // 주문의 아이템 리스트를 통해 총 가격 계산
        double totalPrice = 0.0;

        for (OrderItem orderItem : order.getOrderItems()) {
            totalPrice += orderItem.getPrice();
        }

        // 주문 상태 업데이트 (예: 결제 완료 상태로 변경)
        order.changeOrderStatus(OrderStatus.COMPLETED);
        order.changeTotalPrice(totalPrice); // 총 가격 설정

        // 구매 정보 저장 (멤버-강의 연결)
        for (OrderItem orderItem : order.getOrderItems()) {
            MemberCourse memberCourse = MemberCourse.builder()
                    .member(order.getMember())
                    .course(orderItem.getCourse())
                    .purchaseDate(new Date())
                    .build();
            memberCourseRepository.save(memberCourse);
        }

        // 주문 정보 저장
        orderRepository.save(order);
        log.info("저장완료");

        // 주문 DTO 반환
        return new OrderDTO(order);
    }


    @Override
    public OrderDTO add(OrderDTO orderDTO,Long memberId) {
        orderDTO.setMemberId(memberId);
        Order order = orderDTO.toEntity(orderDTO); // Order DTO를 Order로 변환
        order = orderRepository.save(order); // Order 저장
        double totalPrice = 0.0;

        // orderDTO안에 orderItemDTOList를 orderItemList로 변환
        // DTO안에 있는 강의 번호를 조회해 orderItemlist
        for (OrderItemDTO orderItemDTO : orderDTO.getOrderItemDTOList()) {
            log.debug("orderItem {} ", orderItemDTO);
            Course course = courseRepository.findById(orderItemDTO.getCourseId()).orElseThrow();
            orderItemDTO.setPrice(course.getCoursePrice());
            orderItemDTO.setCourseAttribute(String.valueOf(course.getCourseAttribute()));
            OrderItem orderItem = orderItemRepository.save(orderItemDTO.toEntity(orderItemDTO,order));
            order.getOrderItems().add(orderItem);
            totalPrice += orderItem.getPrice();
        }
        order.changeTotalPrice(totalPrice);
        order = orderRepository.save(order);
        orderDTO.setTotalPrice(totalPrice);
        return orderDTO;
    }

    @Override
    public OrderDTO read(Long orderId) {
        log.info("read Order By orderId {}", orderId);
        try {
            Order order = orderRepository.findById(orderId).orElseThrow(OrderException.ORDER_NOT_FOUND::get);

            List<OrderItemDTO> orderItemDTOS=new ArrayList<>();
            for (OrderItem orderItem : order.getOrderItems()) {
                OrderItemDTO orderItemDTO=new OrderItemDTO();
                orderItemDTO.setPrice(orderItem.getCourse().getCoursePrice());
                orderItemDTOS.add(new OrderItemDTO(orderItem));
            }

            OrderDTO orderDTO = new OrderDTO(order);

            orderDTO.setOrderItemDTOList(orderItemDTOS);
            log.info("read order {}", orderDTO);
            return orderDTO;
        }catch (Exception e) {
            log.error(e);
            throw OrderException.ORDER_NOT_FOUND.get();
        }

    }

    @Override
    @Transactional
    public OrderUpdateDTO update(OrderUpdateDTO orderUpdateDTO, Long orderId) {
        try {
            Order foundOrder = orderRepository.findById(orderId)
                    .orElseThrow(OrderException.ORDER_NOT_FOUND::get);

            // 주문 상태 업데이트
            foundOrder.changeOrderStatus(OrderStatus.valueOf(orderUpdateDTO.getOrderStatus()));

            // 기존 주문 아이템을 가져옵니다.
            List<OrderItem> existingItems = foundOrder.getOrderItems();

            // 새 아이템을 추가 및 업데이트
            for (OrderItemDTO dto : orderUpdateDTO.getOrderItemDTOList()) {
                // 기존 아이템 중에서 해당 아이템을 찾습니다.
                Optional<OrderItem> existingItemOpt = existingItems.stream()
                        .filter(item -> item.getCourse().getCourseId().equals(dto.getCourseId()))
                        .findFirst();

                if (existingItemOpt.isPresent()) {
                    // 아이템이 이미 존재하는 경우, 업데이트
                    OrderItem existingItem = existingItemOpt.get();
                    // 가격 업데이트 (필요시 추가 로직)
                    orderItemRepository.save(existingItem); // 변경사항 저장
                } else {
                    // 새 아이템 추가
                    Course course = courseRepository.findById(dto.getCourseId()).get();
                    if(course == null){
                        throw CourseException.COURSE_NOT_FOUND.getCourseException();
                    }
                    dto.setCourseAttribute(String.valueOf(course.getCourseAttribute()));
                    OrderItem newItem = dto.toEntity(dto, foundOrder); // 새로운 OrderItem 생성
                    orderItemRepository.save(newItem); // 새로운 아이템 저장
                    foundOrder.getOrderItems().add(newItem); // 기존 리스트에 추가
                }
            }

            // 삭제할 아이템 찾기
            List<Long> updatedCourseIds = orderUpdateDTO.getOrderItemDTOList().stream()
                    .map(OrderItemDTO::getCourseId)
                    .toList();

            // 기존 아이템 중 삭제할 아이템 제거
            existingItems.removeIf(existingItem ->
                    !updatedCourseIds.contains(existingItem.getCourse().getCourseId())
            );

            // 총 금액 계산
            double totalPrice = foundOrder.getOrderItems().stream()
                    .mapToDouble(OrderItem::getPrice) // 각 아이템의 가격을 가져와서
                    .sum(); // 총합 계산

            foundOrder.changeTotalPrice(totalPrice); // 총 금액을 주문에 설정
            return new OrderUpdateDTO(foundOrder);
        }catch (Exception e){
            log.error("수정 오류,"+e.getMessage());
            throw OrderException.NOT_MODIFIED.get();
        }

    }




    @Override
    public void delete(Long orderId) {
        try {
            if (!orderRepository.existsById(orderId)) {
                throw new OrderTaskException("주문이 존재하지 않습니다." ,404);
            }
            orderRepository.deleteById(orderId);
        }catch (Exception e){
            log.error(e);
            throw OrderException.NOT_DELETED.get();
        }

    }

//    @Override
//    public List<OrderDTO> readAll() {
//        List<Order> orders = orderRepository.findAll();
//        List<OrderDTO> orderDTOList = new ArrayList<>();
//        for (int i = 0; i <orders.size(); i++) {
//            orderDTOList.add(new OrderDTO(orders.get(i)));
//            for (OrderItem orderItem : orders.get(i).getOrderItems()) {
//                orderDTOList.get(i).getOrderItemDTOList().add(new OrderItemDTO(orderItem));
//            }
//        }
//        return orderDTOList;
//    }


    @Override
    public List<OrderDTO> readAll() {
        List<Order> orders = orderRepository.findAll();
        List<OrderDTO> orderDTOList = new ArrayList<>();

        for (Order order : orders) {
            OrderDTO orderDTO = new OrderDTO(order);
            orderDTO.setOrderItemDTOList(new ArrayList<>()); // 리스트 초기화

            for (OrderItem orderItem : order.getOrderItems()) {
                orderDTO.getOrderItemDTOList().add(new OrderItemDTO(orderItem));
            }
            orderDTOList.add(orderDTO);
        }

        return orderDTOList;
    }

    @Override
    public List<OrderDTO> getOrdersById(Long memberId) {
        Member member = memberRepository.getMemberInfo(memberId);
        List<Order> orders = orderRepository.findByMember(member);
        List<OrderDTO> orderDTOListByMember = new ArrayList<>();

        for (Order order : orders) {
            OrderDTO orderDTO = new OrderDTO(order);
            orderDTO.setOrderItemDTOList(new ArrayList<>()); // 리스트 초기화

            for (OrderItem orderItem : order.getOrderItems()) {
                orderDTO.getOrderItemDTOList().add(new OrderItemDTO(orderItem));
            }
            orderDTOListByMember.add(orderDTO);
        }
        return orderDTOListByMember;
    }


    @Override
    public void deleteAll() {
        orderRepository.deleteAll();
    }
}
