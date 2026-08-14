from flask import Flask, jsonify
from langchain_ollama import OllamaLLM
from flask import request
import numpy as np
import pandas as pd

app = Flask(__name__)

llm = OllamaLLM(model="phi3:mini")

SYSTEM_PROMPT = """You are a helpful trading assistant for OpenEx, a simulated
crypto exchange. Answer questions about trading concepts (limit orders, market
orders, order books) clearly and concisely. If asked about a user's wallet
balance, say you don't have that information yet."""

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

	full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}\nAssistant:"
	response = llm.invoke(full_prompt)

	return jsonify({'response': response})


if __name__ == '__main__':
	app.run(port=5000, debug=True)