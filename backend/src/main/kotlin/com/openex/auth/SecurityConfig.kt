package com.openex.auth

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(
	private val jwtAuthFilter: JwtAuthFilter
) {

	@Bean
	fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		http
			.csrf { it.disable() }
			.sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
			.authorizeHttpRequests { auth ->
				auth
					.requestMatchers("/auth/**", "/health", "/ws/**").permitAll()
					.anyRequest().authenticated()
			}
			.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)

		return http.build()
	}
}