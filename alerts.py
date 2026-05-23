def generate_alert(deforestation_percent, forest_percent=None):
    """
    Evaluates calculated canopy loss rates against international biosphere safety limits.
    Returns status warnings, dynamic action recommendations, and severity levels.
    """
    rate = float(deforestation_percent)
    forest = float(forest_percent) if forest_percent is not None else None
    
    # If remaining forest cover is dense (>= 80%), avoid critical alarm for slow long-term decay
    if forest is not None and forest >= 80.0:
        if rate >= 8.0:
            return {
                "status": "⚠️ WARNING: Tree cover is decreasing",
                "severity": "HIGH",
                "badge_color": "var(--warning)",
                "message": "We should monitor this area closely to prevent further loss.",
                "mitigation_steps": [
                    "Flag coordinates for subsequent Sentinel acquisition orbits",
                    "Conduct ground audit verification on biosphere borders"
                ]
            }
        else:
            return {
                "status": "✓ NOMINAL: Stable canopy",
                "severity": "LOW",
                "badge_color": "var(--accent-primary)",
                "message": "Forest cover and vegetation index remain within safe, stable ecological thresholds.",
                "mitigation_steps": [
                    "Maintain standard periodic orbit pass tracking schedule",
                    "Archive database analysis to standard logs registry"
                ]
            }
            
    if rate >= 5.0:
        return {
            "status": "⚠️ ALERT: High tree loss detected!",
            "severity": "CRITICAL",
            "badge_color": "var(--danger)",
            "message": "This area has lost a lot of trees recently. We need to take action to protect the remaining forest.",
            "mitigation_steps": [
                "Deploy emergency satellite ground patrol telemetry",
                "Execute local government logging moratorium protocol",
                "Initiate urgent multi-spectral NDVI re-scanning pass"
            ]
        }
    elif rate >= 2.0:
        return {
            "status": "⚠️ WARNING: Tree cover is decreasing",
            "severity": "HIGH",
            "badge_color": "var(--warning)",
            "message": "We should monitor this area closely to prevent further loss.",
            "mitigation_steps": [
                "Flag coordinates for subsequent Sentinel acquisition orbits",
                "Conduct ground audit verification on biosphere borders",
                "Review commercial land development logging permits"
            ]
        }
    else:
        return {
            "status": "✓ NOMINAL: Stable canopy",
            "severity": "LOW",
            "badge_color": "var(--accent-primary)",
            "message": "Forest cover and vegetation index remain within safe, stable ecological thresholds.",
            "mitigation_steps": [
                "Maintain standard periodic orbit pass tracking schedule",
                "Archive database analysis to standard logs registry"
            ]
        }

    
