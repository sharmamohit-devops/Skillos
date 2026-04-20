import os
import firebase_admin
from firebase_admin import credentials, firestore
import logging
from pathlib import Path

logger = logging.getLogger(__name__)
_firebase_disabled_reason = None
_backend_root = Path(__file__).resolve().parents[1]

def initialize_firebase():
    global _firebase_disabled_reason

    if _firebase_disabled_reason:
        return False

    if not firebase_admin._apps:
        try:
            cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            project_id = os.getenv("FIREBASE_PROJECT_ID", "skillos-abe52")

            if cred_path:
                cred_file = Path(cred_path).expanduser()
                if not cred_file.is_absolute():
                    cred_file = _backend_root / cred_file
                if cred_file.exists():
                    firebase_admin.initialize_app(
                        credentials.Certificate(str(cred_file)),
                        options={"projectId": project_id},
                    )
                    logger.info("Firebase Admin initialized successfully.")
                    return True
                _firebase_disabled_reason = f"Service account file not found: {cred_file}"
                logger.warning("Firebase cache disabled: %s", _firebase_disabled_reason)
                return False

            _firebase_disabled_reason = (
                "No Firebase Admin credentials configured. "
                "Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_APPLICATION_CREDENTIALS to enable caching."
            )
            logger.warning("Firebase cache disabled: %s", _firebase_disabled_reason)
            return False
        except Exception as e:
            _firebase_disabled_reason = str(e)
            logger.warning("Firebase cache disabled: %s", _firebase_disabled_reason)
            return False

    return True

def get_db():
    if not initialize_firebase():
        return None
    return firestore.client()

def cache_analysis_chunk(user_id: str, resume_hash: str, analysis_type: str, data: dict):
    """
    Saves a chunk of data to Firestore
    """
    try:
        db = get_db()
        if db is None:
            return
        # Path: resumes/{user_id}_{resume_hash}/chunks/{analysis_type}
        doc_ref = db.collection('resumes').document(f"{user_id}_{resume_hash}").collection('chunks').document(analysis_type)
        doc_ref.set(data, merge=True)
        logger.info(f"Successfully cached {analysis_type} for {user_id}_{resume_hash}")
    except Exception as e:
        logger.error(f"Failed to cache {analysis_type} chunk: {e}")
    
def get_analysis_chunk(user_id: str, resume_hash: str, analysis_type: str):
    try:
        db = get_db()
        if db is None:
            return None
        doc_ref = db.collection('resumes').document(f"{user_id}_{resume_hash}").collection('chunks').document(analysis_type)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"Failed to fetch {analysis_type} chunk: {e}")
        return None
