from pathlib import Path
import logging
import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, HTMLResponse

from app import config
from app.rtmt import RTMiddleTier
from app.prompts import system_prompt
#from app.tools import search_products_text_tool


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-fastapi")

# ── Singleton del middle-tier que hace el puente con OpenAI ───────────────────
rtmt = RTMiddleTier(
    endpoint=config.AZURE_OPENAI_ENDPOINT,
    deployment=config.OPENAI_DEPLOYMENT_REALTIME,
    api_key=config.AZURE_OPENAI_API_KEY,
    api_version=config.OPENAI_API_VERSION_REALTIME,
    system_prompt=system_prompt,
)

#rtmt.add_tool(search_products_text_tool)

# ── FastAPI ────────────────────────────────────────────────────────────────────
app = FastAPI(title="Realtime-Voice-Demo")

# ▶ WebSocket principal
@app.websocket("/realtime")
async def realtime_ws(ws: WebSocket):
    await ws.accept()
    try:
        await rtmt.forward_messages(ws)
    except WebSocketDisconnect:
        logger.info("Cliente desconectado (WebSocketDisconnect)")
    except Exception as e:
        logger.error("Error inesperado en realtime_ws: %s", e)
