from anthropic import Anthropic
import os
from dotenv import load_dotenv

SYSTEM_MESSAGE = "You are a chatbot. You will have a conversation with a user. Be friendly and concise"

def add_user_message(messages, text):
    user_message = {'role': 'user', 'content': text}
    messages.append(user_message)

def add_assistant_message(messages, text):
    assistant_message = {'role': 'assistant', 'content': text}
    messages.append(assistant_message)

def chat(messages):
    response = client.messages.create(
        model=MODEL,
        max_tokens=100,
        messages=messages,
        system=SYSTEM_MESSAGE
    )
    return response.content[0].text
    

if __name__ == "__main__":
    load_dotenv()
    URL = os.environ.get('ANTHROPIC_BASE_URL')
    KEY = os.environ.get('ANTHROPIC_KEY')
    MODEL = os.environ.get('MODEL')

    client = Anthropic(
        base_url=URL,
        api_key=KEY,
    )

    print(f"Chatting with {MODEL} model at {URL}\n")

    messages = []

    while True:
        message = input("> ")

        add_user_message(messages, message)

        response = chat(messages)

        add_assistant_message(messages, response)

        print(response)
