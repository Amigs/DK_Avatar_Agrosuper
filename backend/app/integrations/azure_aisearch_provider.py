## _______________________________________________________________________________________
## En este archivo se define un cliente para interactuar con el servicio de
## Azure AI Search. Se encarga de inicializar el cliente de búsqueda utilizando
## las credenciales y el nombre del índice definidos en la configuración de la aplicación.
## _______________________________________________________________________________________

#-----------------------------------------------------------------------------------------
#region             Librerías
#-----------------------------------------------------------------------------------------

from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

from app.core.config import AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_INDEX, AZURE_SEARCH_KEY

#-----------------------------------------------------------------------------------------
#region             Clase para el cliente de Azure AI Search
#-----------------------------------------------------------------------------------------

class AzureAISearch:
    """
    Clase que encapsula la lógica para inicializar y gestionar
    el cliente de búsqueda de Azure AI Search.
    """
    def __init__(self):
        # Inicializa el cliente de búsqueda con las credenciales obtenidas
        self.client : SearchClient = SearchClient(
            endpoint=AZURE_SEARCH_ENDPOINT,
            index_name=AZURE_SEARCH_INDEX,
            credential=AzureKeyCredential(AZURE_SEARCH_KEY)
        )

#-----------------------------------------------------------------------------------------
#region             Instancia del cliente
#-----------------------------------------------------------------------------------------

# Crea una instancia global del proveedor de búsqueda de Azure
ai_search_provider : AzureAISearch = AzureAISearch()