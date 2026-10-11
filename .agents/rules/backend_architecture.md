---
description: Constraints for FastAPI backend modular architecture and database models
---

# Backend Modular Architecture

This project strictly follows a domain-driven, modular architecture for the FastAPI backend. 
All features must be encapsulated within `app/modules/<module_name>/`.

## Database Models Constraint
**Never** use a centralized `app/models/` folder for SQLAlchemy models. All models must be co-located with their respective domains inside the `modules/` directory.

Follow these strict rules when creating or moving models:
1. **Single Model Modules:** If a module has exactly one model, name the file `model.py` and place it directly inside the module directory.
   - *Example:* `app/modules/auth/model.py`
2. **Multiple Model Modules:** If a module contains more than one model, create a `models/` subfolder inside the module directory and place the models there.
   - *Example:* `app/modules/chat/models/chat_session.py` and `app/modules/chat/models/chat_message.py`
3. **Base Class:** The SQLAlchemy `Base` class must be imported from `app.core.base`.
4. **Alembic:** All decentralized models must be explicitly imported in `alembic/env.py` to ensure migrations can detect them.
