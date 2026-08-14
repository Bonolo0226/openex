import requests

KOTLIN_API_BASE = "http://localhost:8080"


def get_wallet_balances(jwt_token: str) -> str:
	response = requests.get(
		f"{KOTLIN_API_BASE}/api/wallets",
		headers={"Authorization": f"Bearer {jwt_token}"}
	)

	if response.status_code != 200:
		return "Could not retrieve wallet balances."

	balances = response.json()

	if not balances:
		return "You have no accounts yet."

	lines = [f"{b['currency']}: {b['balance']}" for b in balances]
	return "Your balances: " + ", ".join(lines)