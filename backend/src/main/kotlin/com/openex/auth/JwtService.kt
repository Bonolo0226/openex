package com.openex.auth

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
	@Value("\${jwt.secret}") private val secret: String,
	@Value("\${jwt.expiration-ms}") private val expirationMs: Long
) {
	private val signingKey: SecretKey by lazy {
		Keys.hmacShaKeyFor(secret.toByteArray())
	}

	fun generateToken(username: String): String {
		val now = Date()
		val expiry = Date(now.time + expirationMs)

		return Jwts.builder()
			.subject(username)
			.issuedAt(now)
			.expiration(expiry)
			.signWith(signingKey)
			.compact()
	}

	fun extractUsername(token: String): String {
		return Jwts.parser()
			.verifyWith(signingKey)
			.build()
			.parseSignedClaims(token)
			.payload
			.subject
	}

	fun isTokenValid(token: String): Boolean {
		return try {
			Jwts.parser()
				.verifyWith(signingKey)
				.build()
				.parseSignedClaims(token)
			true
		} catch (ex: Exception) {
			false
		}
	}
}