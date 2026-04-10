"""Platform Health Route — GET /health/platform returns loader reports and diagnostics."""
from fastapi import Request


def mount(app):
    @app.get("/health/platform")
    async def platform_health(request: Request):
        reports = getattr(request.app.state, 'loader_reports', {})

        summary = {}
        for name, report in reports.items():
            if isinstance(report, dict):
                summary[name] = {
                    'discovered': report.get('discovered', 0),
                    'registered': report.get('registered', 0),
                    'skipped': report.get('skipped', 0),
                    'errors': len(report.get('errors', [])) if isinstance(report.get('errors'), list) else 0,
                }

        config = getattr(request.app.state, 'platform_config', None)
        loaded_apps = getattr(request.app.state, 'loaded_apps', [])
        skipped_apps = getattr(request.app.state, 'skipped_apps', [])

        return {
            'status': 'ok',
            'platform': getattr(config, 'title', 'unknown') if config else 'unknown',
            'profile': getattr(config, 'profile', 'unknown') if config else 'unknown',
            'loaders': summary,
            'apps': {
                'loaded': len(loaded_apps),
                'skipped': len(skipped_apps),
            },
        }
