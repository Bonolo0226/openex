package com.openex.ledger

import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface AccountRepository : JpaRepository<Account, UUID> {
	fun findByUserIdAndCurrency(userId: UUID, currency: String): Optional<Account>
}