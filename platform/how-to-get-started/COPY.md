# Only overwrite if A is newer (avoid clobbering newer files in B)

rsync -av --existing --update /path/to/A/ /path/to/B/

# Dry run first (highly recommended)

rsync -av --existing --dry-run /path/to/A/ /path/to/B/
