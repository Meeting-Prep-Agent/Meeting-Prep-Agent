from typing import List, Dict, Any
from backend.utils.logger import logger
import uuid
import datetime

class CommitmentExtractor:
    def __init__(self):
        pass

    def parse_commitments(self, raw_items: List[Dict[str, Any]], meeting_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        Processes raw commitment extraction from LLM and formats it for the DB.
        """
        processed = []
        for item in raw_items:
            try:
                # Basic validation
                description = item.get("description")
                if not description or len(description) < 5:
                    continue
                
                owner = item.get("owner", "Unknown")
                owner_name = item.get("owner_name") or owner
                
                # Handle due date parsing if present
                due_date = None
                raw_date = item.get("due_date")
                if raw_date:
                    try:
                        due_date = datetime.datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
                    except:
                        logger.warning(f"Failed to parse due_date: {raw_date}")

                processed.append({
                    "id": uuid.uuid4(),
                    "meeting_id": meeting_id,
                    "owner": owner,
                    "owner_name": owner_name,
                    "description": description,
                    "due_date": due_date,
                    "priority": item.get("priority", "Medium"),
                    "is_critical": item.get("priority") == "High",
                    "status": "Pending",
                    "created_at": datetime.datetime.utcnow()
                })
            except Exception as e:
                logger.error(f"Error parsing commitment item: {e}")
                
        return processed

    def detect_duplicates(self, new_commitments: List[Dict[str, Any]], existing_commitments: List[Any]) -> List[Dict[str, Any]]:
        """
        Simple deduplication logic based on fuzzy description matching.
        """
        # For MVP, we'll just return all new ones. 
        # In production, we'd use semantic similarity.
        return new_commitments
