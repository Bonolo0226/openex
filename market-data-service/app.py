from flask import Flask, jsonify
from langchain_ollama import OllamaLLM
from flask import request
from flask_cors import CORS
import numpy as np
import pandas as pd
from tools import get_wallet_balances

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

llm = OllamaLLM(model="phi3:mini")

SYSTEM_PROMPT = """You are a helpful trading assistant for OpenEx, a simulated
crypto exchange. Answer questions about trading concepts (limit orders, market
orders, order books) clearly and concisely. If wallet balance data is provided
below, use it directly to answer the user's question accurately."""

def generate_market_data(starting_price=50000, num_points=100, drift=0.0002, volatility=0.01):
	random_returns = np.random.normal(loc=drift, scale=volatility, size=num_points)
	price_multipliers = np.cumprod(1 + random_returns)
	prices = starting_price * price_multipliers

	timestamps = pd.date_range(end=pd.Timestamp.now(), periods=num_points, freq='min')

	df = pd.DataFrame({
		'timestamp': timestamps,
		'price': prices
	})

	df['moving_average_10'] = df['price'].rolling(window=10).mean()

	return df


@app.route('/api/market-data')
def market_data():
	df = generate_market_data()
	df = df.fillna(0)

	records = df.to_dict(orient='records')
	for record in records:
		record['timestamp'] = record['timestamp'].isoformat()

	return jsonify(records)


@app.route('/health')
def health():
	return jsonify({'status': 'UP'})

@app.route('/api/chat', methods=['POST'])
def chat():
	data = request.get_json()
	user_message = data.get('message', '')

	if not user_message:
		return jsonify({'error': 'message is required'}), 400

	jwt_token = request.headers.get('Authorization', '').replace('Bearer ', '')

	balance_keywords = ['balance', 'wallet', 'how much', 'funds']
	needs_wallet_data = any(keyword in user_message.lower() for keyword in balance_keywords)

	if needs_wallet_data and jwt_token:
		wallet_info = get_wallet_balances(jwt_token)
		full_prompt = f"{SYSTEM_PROMPT}\n\nWallet data: {wallet_info}\n\nUser: {user_message}\nAssistant:"
	elif needs_wallet_data and not jwt_token:
		return jsonify({'response': "Please log in to check your wallet balance."})
	else:
		full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}\nAssistant:"

	response = llm.invoke(full_prompt)
	return jsonify({'response': response})


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000, debug=True)