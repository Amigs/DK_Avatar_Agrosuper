from pydantic import BaseModel, Field
from typing import List
from typing import List, Dict, Any


#-----------------------------------------------------------------------------------------
#                             Esquemas para categorias
#-----------------------------------------------------------------------------------------

# Solicitud que contiene información de la votación del usuario
class RequestHTTPCategory(BaseModel):
    message_id: str
    rate: bool

# Respuesta simple del endpoint de votación
class ResponseHTTPCategory(BaseModel):
    message_id: str
    text: str

#-----------------------------------------------------------------------------------------
#                             Esquemas para proyectos
#-----------------------------------------------------------------------------------------

# Solicitud que contiene información de la votación del usuario
class RequestHTTPProject(BaseModel):
    message_id: str
    rate: bool

# Respuesta simple del endpoint de votación
class ResponseHTTPProject(BaseModel):
    message_id: str
    text: str
