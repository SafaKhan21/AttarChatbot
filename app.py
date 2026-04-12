from flask import Flask, render_template, request, jsonify, session
from BE import get_attar_response
import logging
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", os.urandom(24))  # Required for session


@app.route('/')
@app.route('/home')
def index():
    # Clear history on fresh load
    session['history'] = []
    return render_template('chatbot.html')


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get('msg') or request.form.get('msg', '')).strip()

    if not message:
        return jsonify(response='لم يتم إرسال أي رسالة. / No message provided.'), 400

    # Retrieve conversation history from session
    history = session.get('history', [])

    try:
        response_text, escalate = get_attar_response(message, history)
        logger.info(f"User: {message[:80]} | Bot: {response_text[:80]}")

        # Append this turn to history (keep last 10 turns to avoid token overflow)
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": response_text})
        session['history'] = history[-20:]  # keep last 20 messages (10 turns)

        return jsonify(response=response_text, escalate=escalate)

    except Exception as e:
        import traceback
        logger.error(f"Error: {e}\n{traceback.format_exc()}")
        return jsonify(response='حدث خطأ. يرجى المحاولة مرة أخرى. / An error occurred, please try again.'), 500


@app.route('/reset', methods=['POST'])
def reset():
    """Clear conversation history for current session."""
    session['history'] = []
    return jsonify(status='ok')


if __name__ == '__main__':
    app.run(debug=True)
     
