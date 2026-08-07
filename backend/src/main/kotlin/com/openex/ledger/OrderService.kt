package com.openex.ledger

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

data class CreateOrderRequest(
	val accountId: UUID,
	val side: OrderSide,
	val type: OrderType,
	val price: BigDecimal?,
	val quantity: BigDecimal
)

data class OrderResponse(
	val id: UUID,
	val side: OrderSide,
	val type: OrderType,
	val price: BigDecimal?,
	val quantity: BigDecimal,
	val status: OrderStatus
)

@Service
class OrderService(
	private val orderRepository: OrderRepository,
	private val idempotencyKeyRepository: IdempotencyKeyRepository,
	private val objectMapper: ObjectMapper,
	private val matchingEngineService: MatchingEngineService
) {

	@Transactional
	fun createOrder(
		userId: UUID,
		idempotencyKey: String,
		request: CreateOrderRequest
	): OrderResponse {
		val existingKey = idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey)
		if (existingKey.isPresent) {
			return objectMapper.readValue(existingKey.get().responseBody, OrderResponse::class.java)
		}

		require(request.quantity > BigDecimal.ZERO) { "Quantity must be positive" }
		if (request.type == OrderType.LIMIT) {
			require(request.price != null && request.price > BigDecimal.ZERO) {
				"Limit orders must have a positive price"
			}
		}

		val order = Order(
			id = UUID.randomUUID(),
			userId = userId,
			accountId = request.accountId,
			side = request.side,
			type = request.type,
			price = request.price,
			quantity = request.quantity
		)
		orderRepository.save(order)

		val matchedOrder = matchingEngineService.submitAndMatch(order)

		val response = OrderResponse(
			id = matchedOrder.id,
			side = matchedOrder.side,
			type = matchedOrder.type,
			price = matchedOrder.price,
			quantity = matchedOrder.quantity,
			status = matchedOrder.status
		)

		idempotencyKeyRepository.save(
			IdempotencyKey(
				id = UUID.randomUUID(),
				idempotencyKey = idempotencyKey,
				responseBody = objectMapper.writeValueAsString(response)
			)
		)

		return response
	}
}