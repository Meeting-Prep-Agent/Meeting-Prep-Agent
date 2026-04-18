from typing import Dict, Any, List
from backend.utils.logger import logger

class BehavioralAnalyzer:
    def __init__(self):
        self.disc_categories = ["Analytical", "Assertive", "Amiable", "Expressive"]

    def update_profile(self, current_profile: Dict[str, Any], new_signals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates the contact's behavioral profile based on new interaction signals.
        """
        updated = current_profile.copy()
        
        # 1. Update communication style (DISC)
        style = new_signals.get("communication_style")
        if style in self.disc_categories:
            updated["communication_style"] = style
            
        # 2. Add hot button topics (deduplicated)
        new_topics = new_signals.get("hot_button_topics", [])
        existing_topics = set(updated.get("hot_button_topics", []))
        existing_topics.update(new_topics)
        updated["hot_button_topics"] = list(existing_topics)
        
        # 3. Update decision patterns
        pattern = new_signals.get("decision_pattern")
        if pattern:
            # We could keep a history, but for MVP we'll just store the latest
            updated["decision_pattern"] = pattern
            
        # 4. Preferred communication
        pref = new_signals.get("preferred_communication")
        if pref:
            updated["preferred_communication"] = pref
            
        # 5. Confidence Score (Self-calculated based on interaction consistency)
        # Placeholder for complex logic
        updated["intelligence_confidence"] = min(1.0, updated.get("intelligence_confidence", 0.1) + 0.1)
        
        return updated
