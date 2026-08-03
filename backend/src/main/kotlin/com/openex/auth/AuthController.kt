package com.openex.auth

import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class RegisterRequest(val username: String, val password: String)
data class LoginRequest(val username: String, val password: String)
data class AuthResponse(val token: String)

@RestController
@RequestMapping("/auth")
class AuthController(
	private val userRepository: UserRepository,
	private val passwordEncoder: PasswordEncoder,
	private val jwtService: JwtService
) {

	@PostMapping("/register")
	fun register(@RequestBody request: RegisterRequest): ResponseEntity<Any> {
		if (userRepository.findByUsername(request.username).isPresent) {
			return ResponseEntity.badRequest().body(mapOf("error" to "Username already taken"))
		}

		val user = User(
			id = UUID.randomUUID(),
			username = request.username,
			passwordHash = passwordEncoder.encode(request.password)
		)
		userRepository.save(user)

		val token = jwtService.generateToken(user.username)
		return ResponseEntity.ok(AuthResponse(token))
	}

	@PostMapping("/login")
	fun login(@RequestBody request: LoginRequest): ResponseEntity<Any> {
		val user = userRepository.findByUsername(request.username)
			.orElse(null)
			?: return ResponseEntity.status(401).body(mapOf("error" to "Invalid username or password"))

		if (!passwordEncoder.matches(request.password, user.passwordHash)) {
			return ResponseEntity.status(401).body(mapOf("error" to "Invalid username or password"))
		}

		val token = jwtService.generateToken(user.username)
		return ResponseEntity.ok(AuthResponse(token))
	}
}