package com.openex.ledger

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

enum class OrderSide { BUY, SELL }
enum class OrderType { LIMIT, MARKET }
enum class OrderStatus { OPEN, FILLED, CANCELLED }

@Entity
@Table(name = "orders")
data class Order(
	@Id
	val id: UUID,

	@Column(name = "user_id", nullable = false)
	val userId: UUID,

	@Column(name = "account_id", nullable = false)
	val accountId: UUID,

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	val side: OrderSide,

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	val type: OrderType,

	@Column
	val price: BigDecimal?,

	@Column(nullable = false)
	val quantity: BigDecimal,

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	val status: OrderStatus = OrderStatus.OPEN,

	@Column(name = "created_at")
	val createdAt: LocalDateTime = LocalDateTime.now()
)