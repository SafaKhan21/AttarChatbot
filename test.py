import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

key = os.getenv("OPENAI_API_KEY")
print("Key found:", key[:10] if key else "NOT FOUND")

client = OpenAI(api_key=key)
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "قل مرحبا"}],
    max_tokens=50
)
print("Response:", response.choices[0].message.content)