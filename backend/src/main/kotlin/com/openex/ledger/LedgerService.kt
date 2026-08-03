package com.openex.ledger

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class LedgerService(
	private val ledgerEntryRepository: LedgerEntryRepository,
	private val accountRepository: AccountRepository
) {

	@Transactional
	fun recordTransfer(
		fromAccountId: UUID,
		toAccountId: UUID,
		amount: BigDecimal
	): UUID {
		require(amount > BigDecimal.ZERO) { "Transfer amount must be positive" }

		accountRepository.findById(fromAccountId)
			.orElseThrow { IllegalArgumentException("From-account not found: $fromAccountId") }
		accountRepository.findById(toAccountId)
			.orElseThrow { IllegalArgumentException("To-account not found: $toAccountId") }

		val transactionId = UUID.randomUUID()

		val debitEntry = LedgerEntry(
			id = UUID.randomUUID(),
			transactionId = transactionId,
			accountId = fromAccountId,
			amount = amount,
			direction = EntryDirection.DEBIT
		)

		val creditEntry = LedgerEntry(
			id = UUID.randomUUID(),
			transactionId = transactionId,
			accountId = toAccountId,
			amount = amount,
			direction = EntryDirection.CREDIT
		)

		ledgerEntryRepository.save(debitEntry)
		ledgerEntryRepository.save(creditEntry)

		return transactionId
	}
}