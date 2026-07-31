package com.openex.ledger

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import java.math.BigDecimal
import java.util.UUID

@SpringBootTest
class LedgerServiceTest {

	@Autowired
	lateinit var ledgerService: LedgerService

	@Autowired
	lateinit var accountRepository: AccountRepository

	@Autowired
	lateinit var ledgerEntryRepository: LedgerEntryRepository

	@Test
	fun `recordTransfer creates two balanced entries that sum to zero`() {
		val fromAccount = accountRepository.save(
			Account(id = UUID.randomUUID(), userId = UUID.randomUUID(), currency = "USD")
		)
		val toAccount = accountRepository.save(
			Account(id = UUID.randomUUID(), userId = UUID.randomUUID(), currency = "USD")
		)

		val transactionId = ledgerService.recordTransfer(
			fromAccountId = fromAccount.id,
			toAccountId = toAccount.id,
			amount = BigDecimal("100.00")
		)

		val entries = ledgerEntryRepository.findAll()
			.filter { it.transactionId == transactionId }

		assertEquals(2, entries.size, "Expected exactly two ledger entries for one transfer")

		val debit = entries.find { it.direction == EntryDirection.DEBIT }
		val credit = entries.find { it.direction == EntryDirection.CREDIT }

		assertEquals(0, BigDecimal("100.00").compareTo(debit?.amount), "Debit amount should be 100.00")
        assertEquals(0, BigDecimal("100.00").compareTo(credit?.amount), "Credit amount should be 100.00")

		val netSum = entries.sumOf { entry ->
			if (entry.direction == EntryDirection.DEBIT) entry.amount.negate() else entry.amount
		}
		assertEquals(BigDecimal.ZERO.setScale(2), netSum.setScale(2), "Entries must net to zero")
	}
}