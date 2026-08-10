package com.openex.ledger

import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.math.BigDecimal
import java.util.UUID
import java.util.concurrent.locks.ReentrantLock

@Service
class MatchingEngineService(
	private val orderRepository: OrderRepository,
	private val ledgerService: LedgerService,
	private val transactionTemplate: TransactionTemplate,
	private val orderBookBroadcaster: com.openex.realtime.OrderBookBroadcaster
) {
	private val lock = ReentrantLock()

	fun submitAndMatch(incomingOrder: Order): Order {
		lock.lock()
		try {
			return transactionTemplate.execute {
				matchOrder(incomingOrder)
			}!!
		} finally {
			lock.unlock()
		}
	}

	private fun matchOrder(incomingOrder: Order): Order {
		var remainingQuantity = incomingOrder.quantity
		var currentOrder = incomingOrder

		val oppositeSide = if (incomingOrder.side == OrderSide.BUY) OrderSide.SELL else OrderSide.BUY
		val candidates = findMatchCandidates(oppositeSide, incomingOrder)

		for (candidate in candidates) {
			if (remainingQuantity <= BigDecimal.ZERO) break
			if (!pricesMatch(incomingOrder, candidate)) continue

			val tradeQuantity = remainingQuantity.min(candidate.quantity)
			val tradePrice = candidate.price ?: incomingOrder.price
				?: throw IllegalStateException("Cannot execute trade with no price on either side")

			executeTrade(
				buyOrder = if (incomingOrder.side == OrderSide.BUY) currentOrder else candidate,
				sellOrder = if (incomingOrder.side == OrderSide.BUY) candidate else currentOrder,
				quantity = tradeQuantity,
				price = tradePrice
			)

			remainingQuantity -= tradeQuantity

			val updatedCandidate = candidate.copy(
				quantity = candidate.quantity - tradeQuantity,
				status = if (candidate.quantity - tradeQuantity <= BigDecimal.ZERO) OrderStatus.FILLED else OrderStatus.OPEN
			)
			orderRepository.save(updatedCandidate)
			orderBookBroadcaster.broadcastOrderUpdate(updatedCandidate)

			currentOrder = currentOrder.copy(
				quantity = remainingQuantity,
				status = if (remainingQuantity <= BigDecimal.ZERO) OrderStatus.FILLED else OrderStatus.OPEN
			)
		}

		orderRepository.save(currentOrder)
		orderBookBroadcaster.broadcastOrderUpdate(currentOrder)
		return currentOrder
	}

	private fun findMatchCandidates(side: OrderSide, incomingOrder: Order): List<Order> {
		val openOrders = orderRepository.findAll().filter {
			it.side == side && it.status == OrderStatus.OPEN && it.id != incomingOrder.id
		}

		return if (side == OrderSide.SELL) {
			openOrders.sortedWith(compareBy({ it.price ?: BigDecimal.ZERO }, { it.createdAt }))
		} else {
			openOrders.sortedWith(compareByDescending<Order> { it.price ?: BigDecimal.ZERO }.thenBy { it.createdAt })
		}
	}

	private fun pricesMatch(incomingOrder: Order, candidate: Order): Boolean {
		if (incomingOrder.type == OrderType.MARKET || candidate.type == OrderType.MARKET) return true

		val incomingPrice = incomingOrder.price ?: return false
		val candidatePrice = candidate.price ?: return false

		return if (incomingOrder.side == OrderSide.BUY) {
			incomingPrice >= candidatePrice
		} else {
			incomingPrice <= candidatePrice
		}
	}

	private fun executeTrade(buyOrder: Order, sellOrder: Order, quantity: BigDecimal, price: BigDecimal) {
		val tradeValue = quantity * price
		ledgerService.recordTransfer(
			fromAccountId = buyOrder.accountId,
			toAccountId = sellOrder.accountId,
			amount = tradeValue
		)
	}
}