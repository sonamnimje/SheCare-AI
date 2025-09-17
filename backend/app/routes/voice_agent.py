import requests
import os
import json
from pathlib import Path
from fastapi import APIRouter, Request
from dotenv import load_dotenv

router = APIRouter()

# Load environment from local .env if present (keeps parity with main app)
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=str(env_path))

# Load the agent ID from a path relative to this file
agent_id_file = Path(__file__).resolve().parent.parent / "agent_id.json"
try:
    with open(agent_id_file, "r", encoding="utf-8") as f:
        agent_id = json.load(f).get("agent_id")
except Exception:
    agent_id = None

def ask_omni_dimension(agent_id, message):
    url = f"https://api.omnidim.io/agent/{agent_id}/chat"
    headers = {
        "Authorization": f"Bearer {os.getenv('OMNIDIM_API_KEY')}",
        "Content-Type": "application/json"
    }
    data = {"input": message}
    response = requests.post(url, headers=headers, json=data, timeout=30)
    response.raise_for_status()
    return response.json().get("output", "No response from agent.")

@router.post("/voice-chat")
async def voice_chat(request: Request):
    body = await request.json()
    user_message = body.get("message")
    try:
        if not agent_id:
            return {"response": "Voice agent is not configured (missing agent_id)."}
        if not os.getenv("OMNIDIM_API_KEY"):
            return {"response": "Server is missing OMNIDIM_API_KEY."}
        bot_reply = ask_omni_dimension(agent_id, user_message)
        return {"response": bot_reply}
    except Exception as e:
        print("Error from OmniDimension:", e)
        return {"response": "Sorry, I couldn't get a response from OmniDimension."}