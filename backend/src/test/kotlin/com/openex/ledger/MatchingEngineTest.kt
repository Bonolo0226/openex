package com.openex.ledger

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import java.math.BigDecimal
import java.util.UUID
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@SpringBootTest
class MatchingEngineTest {

	@Autowired
	lateinit var matchingEngineService: MatchingEngineService

	@Autowired
	lateinit var accountRepository: AccountRepository

	@Autowired
	lateinit var orderRepository: OrderRepository

	@Autowired
	lateinit var ledgerEntryRepository: LedgerEntryRepository

	@org.junit.jupiter.api.BeforeEach
	fun cleanSlate() {
		orderRepository.deleteAll()
		ledgerEntryRepository.deleteAll()
	}

	private fun newAccount(): Account {
		return accountRepository.save(
			Account(id = UUID.randomUUID(), userId = UUID.randomUUID(), currency = "USD")
		)
	}

	@Test
	fun `matching sell order against an open buy order fills both completely`() {
		val buyerAccount = newAccount()
		val sellerAccount = newAccount()

		val buyOrder = Order(
			id = UUID.randomUUID(),
			userId = UUID.randomUUID(),
			accountId = buyerAccount.id,
			side = OrderSide.BUY,
			type = OrderType.LIMIT,
			price = BigDecimal("50000"),
			quantity = BigDecimal("0.01")
		)
		orderRepository.save(buyOrder)
		matchingEngineService.submitAndMatch(buyOrder)

		val sellOrder = Order(
			id = UUID.randomUUID(),
			userId = UUID.randomUUID(),
			accountId = sellerAccount.id,
			side = OrderSide.SELL,
			type = OrderType.LIMIT,
			price = BigDecimal("50000"),
			quantity = BigDecimal("0.01")
		)
		orderRepository.save(sellOrder)
		val result = matchingEngineService.submitAndMatch(sellOrder)

		assertEquals(OrderStatus.FILLED, result.status)

		val refreshedBuyOrder = orderRepository.findById(buyOrder.id).get()
		assertEquals(OrderStatus.FILLED, refreshedBuyOrder.status)
	}

	@Test
	fun `10 concurrent sell orders against one large buy order all resolve without corruption`() {
		val buyerAccount = newAccount()

		val bigBuyOrder = Order(
			id = UUID.randomUUID(),
			userId = UUID.randomUUID(),
			accountId = buyerAccount.id,
			side = OrderSide.BUY,
			type = OrderType.LIMIT,
			price = BigDecimal("50000"),
			quantity = BigDecimal("0.10")
		)
		orderRepository.save(bigBuyOrder)
		matchingEngineService.submitAndMatch(bigBuyOrder)

		val executor: ExecutorService = Executors.newFixedThreadPool(10)
		val sellOrderIds = mutableListOf<UUID>()

		repeat(10) {
			val sellerAccount = newAccount()
			val sellOrder = Order(
				id = UUID.randomUUID(),
				userId = UUID.randomUUID(),
				accountId = sellerAccount.id,
				side = OrderSide.SELL,
				type = OrderType.LIMIT,
				price = BigDecimal("50000"),
				quantity = BigDecimal("0.01")
			)
			orderRepository.save(sellOrder)
			sellOrderIds.add(sellOrder.id)

			executor.submit {
				matchingEngineService.submitAndMatch(sellOrder)
			}
		}

		executor.shutdown()
		executor.awaitTermination(30, TimeUnit.SECONDS)

		val refreshedBuyOrder = orderRepository.findById(bigBuyOrder.id).get()
		assertEquals(OrderStatus.FILLED, refreshedBuyOrder.status)
		assertEquals(0, BigDecimal.ZERO.compareTo(refreshedBuyOrder.quantity))

		val filledSellCount = sellOrderIds.count { id ->
			orderRepository.findById(id).get().status == OrderStatus.FILLED
		}
		assertEquals(10, filledSellCount, "All 10 sell orders should be fully filled")
	}
}