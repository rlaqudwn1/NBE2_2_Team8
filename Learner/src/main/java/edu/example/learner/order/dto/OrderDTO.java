package edu.example.learner.order.dto;

import edu.example.learner.order.entity.Order;
import edu.example.learner.order.entity.OrderStatus;
import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class OrderDTO {
    private Long oId;

    private List<OrderItemDTO> orderItemDTOList;


    private String orderStatus;

    public OrderDTO(Order order) {
        this.oId=order.getOrderId();
        this.orderStatus= String.valueOf(order.getOrderStatus());
    }

    public Order toEntity(OrderDTO orderDTO) {
        return Order.builder()
                .orderId(orderDTO.getOId())
                .orderStatus(OrderStatus.valueOf(orderDTO.getOrderStatus()))
                .build();
    }
}