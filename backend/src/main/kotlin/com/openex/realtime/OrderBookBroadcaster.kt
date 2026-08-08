package com.openex.realtime

import com.openex.ledger.Order
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

data class OrderBookUpdate(
	val orderId: UUID,
	val side: String,
	val type: String,
	val price: BigDecimal?,
	val quantity: BigDecimal,
	val status: String
)

@Service
class OrderBookBroadcaster(
	private val messagingTemplate: SimpMessagingTemplate
) {
	fun broadcastOrderUpdate(order: Order) {
		val update = OrderBookUpdate(
			orderId = order.id,
			side = order.side.name,
			type = order.type.name,
			price = order.price,
			quantity = order.quantity,
			status = order.status.name
		)
		messagingTemplate.convertAndSend("/topic/orderbook", update)
	}
}