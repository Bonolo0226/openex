package com.openex

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class OpenExApplication

fun main(args: Array<String>) {
	runApplication<OpenExApplication>(*args)
}

@RestController
class HealthController {

	@GetMapping("/health")
	fun health(): Map<String, String> {
		return mapOf("status" to "UP")
	}
}