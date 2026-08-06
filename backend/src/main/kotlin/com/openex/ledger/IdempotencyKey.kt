package com.openex.ledger

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "idempotency_keys")
data class IdempotencyKey(
	@Id
	val id: UUID,

	@Column(name = "idempotency_key", nullable = false, unique = true)
	val idempotencyKey: String,

	@Column(name = "response_body", nullable = false)
	val responseBody: String,

	@Column(name = "created_at")
	val createdAt: LocalDateTime = LocalDateTime.now()
)