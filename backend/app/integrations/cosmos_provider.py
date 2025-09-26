## _______________________________________________________________________________________
## En este archivo se define una clase para interactuar con Azure Cosmos DB.
## Proporciona métodos asíncronos para gestionar la persistencia de las conversaciones,
## incluyendo la creación, almacenamiento y recuperación de sesiones y mensajes.
## _______________________________________________________________________________________

#-----------------------------------------------------------------------------------------
#region             Librerías
#-----------------------------------------------------------------------------------------

from azure.cosmos.aio import CosmosClient
from azure.cosmos import exceptions
from typing import List
import logging

#from app.core.config import AZURE_SEARCH_KEY

#-----------------------------------------------------------------------------------------
#region             Clase Cosmos DB
#-----------------------------------------------------------------------------------------

# class AzureCosmosDB:
#     """
#     Clase que encapsula la lógica para interactuar con Azure Cosmos DB.
#     Gestiona la conexión y las operaciones CRUD para sesiones y mensajes.
#     """
#     def __init__(self):
#         # Obtiene las configuraciones desde el objeto de configuración global
#         self.endpoint = settings.cosmos_db.azure_cosmos_endpoint
#         self.key = settings.cosmos_db.azure_cosmos_key
#         self.database_name = settings.cosmos_db.azure_cosmos_database_name
#         self.container_sessions = settings.cosmos_db.azure_cosmos_session_container_name
#         self.container_messages = settings.cosmos_db.azure_cosmos_message_container_name
        
#         try:
#             # Inicializa el cliente y los clientes de la base de datos y los contenedores
#             self.client = CosmosClient(self.endpoint, self.key)
#             self.database = self.client.get_database_client(self.database_name)
#             self.sessions_container = self.database.get_container_client(self.container_sessions)
#             self.messages_container = self.database.get_container_client(self.container_messages)
#         except exceptions.CosmosHttpResponseError as e:
#             # Captura y registra errores de conexión
#             logging.error(f"Error de conexión a Cosmos DB: {str(e)}")
#             raise

#     #-----------------------------------------------------------------------------------------
#     #region             gestión de sesiones
#     #-----------------------------------------------------------------------------------------

#     async def session_exists(self, session_id: str) -> bool:
#         """Verifica si una sesión existe en el contenedor de sesiones."""
#         try:
#             await self.sessions_container.read_item(
#                 item=session_id,
#                 partition_key=session_id
#             )
#             return True
#         except exceptions.CosmosResourceNotFoundError:
#             return False

# #-----------------------------------------------------------------------------------------
# #region             Instancia del cliente
# #-----------------------------------------------------------------------------------------

# # Crea una instancia global del proveedor de servicios de Azure Cosmos DB
# cosmos_provider : AzureCosmosDB = AzureCosmosDB()