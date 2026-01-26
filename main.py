# main.py

import os
import importlib
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from database import create_database

app = FastAPI()
# app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

app.mount('/static', StaticFiles(directory='static'), name='static')

# app.include_router(routers.index.router)

router_dir = os.path.dirname(__file__) + "/routers"

for filename in os.listdir(router_dir):
    if filename.endswith(".py") and filename != "__init__.py":
        module_name = f"routers.{filename[:-3]}"  # exclude .py
        module = importlib.import_module(module_name)
        if hasattr(module, 'router'):  # confirm router
            app.include_router(module.router)


@app.on_event("startup")
def on_startup():
    # create_database()
    pass

@app.on_event("shutdown")
def on_shutdown():
    pass


# Commands must be single quoted
if __name__ == "__main__":
    uvicorn.run('main:app', host='localhost', port=8000, reload=True)
