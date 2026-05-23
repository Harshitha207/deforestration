def create_chart_data(forest_percent, deforestation_percent):
    """
    Formats analytical forest-vs-deforested data points suitable for
    visual rendering on canvas elements or dashboard charting libraries.
    """
    forest_percent = float(forest_percent)
    deforestation_percent = float(deforestation_percent)
    
    # Prepares cohesive structures for bar/donut components
    return [
        {
            "name": "Remaining Canopy",
            "value": forest_percent,
            "color": "var(--accent-primary)"
        },
        {
            "name": "Deforested Canopy",
            "value": deforestation_percent,
            "color": "var(--danger)"
        }
    ]
