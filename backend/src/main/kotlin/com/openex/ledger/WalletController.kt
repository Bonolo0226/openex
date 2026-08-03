package com.openex.ledger

import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.util.UUID

data class DepositRequest(val currency: String, val amount: BigDecimal)
data class DepositResponse(val accountId: UUID, val transactionId: UUID)

@RestController
@RequestMapping("/api/wallets")
class WalletController(
	private val accountRepository: AccountRepository,
	private val ledgerEntryRepository: LedgerEntryRepository
) {

	@PostMapping("/deposit")
	fun deposit(
		@RequestBody request: DepositRequest,
		authentication: Authentication
	): ResponseEntity<Any> {
		require(request.amount > BigDecimal.ZERO) { "Deposit amount must be positive" }

		val username = authentication.name

		val account = accountRepository.save(
			Account(
				id = UUID.randomUUID(),
				userId = UUID.nameUUIDFromBytes(username.toByteArray()),
				currency = request.currency
			)
		)

		val transactionId = UUID.randomUUID()
		ledgerEntryRepository.save(
			LedgerEntry(
				id = UUID.randomUUID(),
				transactionId = transactionId,
				accountId = account.id,
				amount = request.amount,
				direction = EntryDirection.CREDIT
			)
		)

		return ResponseEntity.ok(DepositResponse(accountId = account.id, transactionId = transactionId))
	}
}