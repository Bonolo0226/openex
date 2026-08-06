package com.openex.ledger

import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/orders")
class OrderController(
	private val orderService: OrderService
) {

	@PostMapping
	fun createOrder(
		@RequestHeader("Idempotency-Key") idempotencyKey: String,
		@RequestBody request: CreateOrderRequest,
		authentication: Authentication
	): ResponseEntity<OrderResponse> {
		val username = authentication.name
		val userId = UUID.nameUUIDFromBytes(username.toByteArray())

		val response = orderService.createOrder(
			userId = userId,
			idempotencyKey = idempotencyKey,
			request = request
		)

		return ResponseEntity.ok(response)
	}
}