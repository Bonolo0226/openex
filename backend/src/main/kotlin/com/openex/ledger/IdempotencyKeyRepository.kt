package com.openex.ledger

import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface IdempotencyKeyRepository : JpaRepository<IdempotencyKey, UUID> {
	fun findByIdempotencyKey(idempotencyKey: String): Optional<IdempotencyKey>
}