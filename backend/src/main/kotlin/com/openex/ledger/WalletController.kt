package com.openex.ledger

import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.util.UUID

data class DepositRequest(val currency: String, val amount: BigDecimal)
data class DepositResponse(val accountId: UUID, val transactionId: UUID)
data class BalanceResponse(val accountId: UUID, val currency: String, val balance: BigDecimal)

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
		val userId = UUID.nameUUIDFromBytes(username.toByteArray())

		val account = accountRepository.findByUserIdAndCurrency(userId, request.currency)
			.orElseGet {
				accountRepository.save(
					Account(
						id = UUID.randomUUID(),
						userId = userId,
						currency = request.currency
					)
				)
			}

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

	@GetMapping
	fun getBalances(authentication: Authentication): ResponseEntity<List<BalanceResponse>> {
		val username = authentication.name
		val userId = UUID.nameUUIDFromBytes(username.toByteArray())

		val accounts = accountRepository.findAll().filter { it.userId == userId }

		val balances = accounts.map { account ->
			val entries = ledgerEntryRepository.findAll().filter { it.accountId == account.id }
			val balance = entries.sumOf { entry ->
				if (entry.direction == EntryDirection.CREDIT) entry.amount else entry.amount.negate()
			}
			BalanceResponse(accountId = account.id, currency = account.currency, balance = balance)
		}

		return ResponseEntity.ok(balances)
	}
}