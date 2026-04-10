"""
Core logic for OpenAPI Splitter.
This module provides the main SDK functionality for splitting OpenAPI specifications.
"""

import os
import sys
import json
import yaml
import logging
from pathlib import Path
from typing import Dict, List, Set, Union, Optional, Any, Tuple
from collections import defaultdict

# Configure logger
logger = logging.getLogger(__name__)


class OpenAPISplitterError(Exception):
    """Custom exception for OpenAPI Splitter errors."""
    pass


class ComponentResolver:
    """Helper class for resolving and filtering OpenAPI components."""
    
    def __init__(self, spec: Dict[str, Any]):
        self.spec = spec
        self.components = spec.get('components', {})
    
    def find_component_references(self, obj: Any, used_components: Set[str]) -> None:
        """
        Recursively find all component references in an object.
        
        Args:
            obj: The object to search for references
            used_components: Set to store found component references
        """
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == '$ref' and isinstance(value, str):
                    if value.startswith('#/components/'):
                        ref_parts = value.split('/')
                        if len(ref_parts) >= 4:
                            component_type = ref_parts[2]
                            component_name = '/'.join(ref_parts[3:])
                            used_components.add(f"{component_type}/{component_name}")
                else:
                    self.find_component_references(value, used_components)
        elif isinstance(obj, list):
            for item in obj:
                self.find_component_references(item, used_components)
    
    def resolve_transitive_references(self, initial_refs: Set[str]) -> Set[str]:
        """
        Resolve all transitive component references.
        
        Args:
            initial_refs: Initial set of component references
            
        Returns:
            Complete set including all transitive dependencies
        """
        all_refs = set(initial_refs)
        to_process = list(initial_refs)
        
        while to_process:
            ref = to_process.pop(0)
            parts = ref.split('/', 1)
            if len(parts) == 2:
                component_type, component_name = parts
                if component_type in self.components:
                    component_def = self.components[component_type].get(component_name)
                    if component_def:
                        new_refs = set()
                        self.find_component_references(component_def, new_refs)
                        for new_ref in new_refs:
                            if new_ref not in all_refs:
                                all_refs.add(new_ref)
                                to_process.append(new_ref)
        
        return all_refs
    
    def filter_components(self, used_refs: Set[str]) -> Dict[str, Any]:
        """
        Filter components to include only those referenced.
        
        Args:
            used_refs: Set of component references to include
            
        Returns:
            Filtered components dictionary
        """
        filtered = {}
        
        for ref in used_refs:
            parts = ref.split('/', 1)
            if len(parts) == 2:
                component_type, component_name = parts
                if component_type in self.components:
                    if component_type not in filtered:
                        filtered[component_type] = {}
                    if component_name in self.components[component_type]:
                        filtered[component_type][component_name] = \
                            self.components[component_type][component_name]
        
        return filtered


class OpenAPISplitter:
    """
    Main class for splitting OpenAPI specifications.
    
    This class provides methods to split large OpenAPI specs into smaller parts
    based on tags or path prefixes while maintaining component integrity.
    """
    
    def __init__(
        self,
        input_file: Union[str, Path],
        output_dir: Union[str, Path] = "split_specs",
        output_format: Optional[str] = None
    ):
        """
        Initialize the OpenAPISplitter.
        
        Args:
            input_file: Path to the OpenAPI specification file
            output_dir: Directory for output files
            output_format: Output format ('yaml' or 'json') or None to auto-detect
            
        Raises:
            OpenAPISplitterError: If input file doesn't exist or format is invalid
        """
        self.input_file = Path(input_file)
        self.output_dir = Path(output_dir)
        
        if not self.input_file.exists():
            raise OpenAPISplitterError(f"Input file not found: {self.input_file}")

        if output_format:
            self.output_format = output_format.lower()
            if self.output_format not in ['yaml', 'json']:
                raise OpenAPISplitterError(f"Invalid output format: {self.output_format}")
        else:
            # Auto-detect format from input file extension
            suffix = self.input_file.suffix.lower()
            if suffix == '.json':
                self.output_format = 'json'
            else:
                self.output_format = 'yaml'
                
        self.spec = None
        self.base_spec = {}
    
    def load_spec(self) -> Dict[str, Any]:
        """
        Load the OpenAPI specification from file.
        
        Returns:
            Loaded OpenAPI specification
            
        Raises:
            OpenAPISplitterError: If loading fails
        """
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                if self.input_file.suffix.lower() in ['.yaml', '.yml']:
                    self.spec = yaml.safe_load(f)
                elif self.input_file.suffix.lower() == '.json':
                    self.spec = json.load(f)
                else:
                    # Try YAML first, then JSON
                    content = f.read()
                    try:
                        self.spec = yaml.safe_load(content)
                    except yaml.YAMLError:
                        try:
                            self.spec = json.loads(content)
                        except json.JSONDecodeError:
                            raise OpenAPISplitterError("Unable to parse file as YAML or JSON")
            
            logger.info(f"Loaded OpenAPI spec from {self.input_file}")
            return self.spec
            
        except Exception as e:
            if isinstance(e, OpenAPISplitterError):
                raise
            raise OpenAPISplitterError(f"Error loading spec: {e}") from e
    
    def create_base_spec(self) -> Dict[str, Any]:
        """
        Create base specification with common elements.
        
        Returns:
            Base specification dictionary
        """
        if not self.spec:
            raise OpenAPISplitterError("No specification loaded")
        
        self.base_spec = {
            'openapi': self.spec.get('openapi', '3.0.0'),
            'info': self.spec.get('info', {}),
            'servers': self.spec.get('servers', []),
            'components': self.spec.get('components', {}),
            'security': self.spec.get('security', []),
            'tags': self.spec.get('tags', []),
        }
        
        # Add optional fields if present
        if 'externalDocs' in self.spec:
            self.base_spec['externalDocs'] = self.spec['externalDocs']
        
        return self.base_spec
    
    def group_by_tags(self) -> Dict[str, List[str]]:
        """
        Group paths by their tags.
        
        Returns:
            Dictionary mapping tag names to lists of paths
        """
        groups = defaultdict(list)
        untagged_paths = []
        
        paths = self.spec.get('paths', {})
        
        for path, methods in paths.items():
            path_tags = set()
            
            for method, operation in methods.items():
                if method.startswith('x-') or method in ['summary', 'description', 'parameters']:
                    continue
                
                if isinstance(operation, dict):
                    operation_tags = operation.get('tags', [])
                    if operation_tags:
                        path_tags.update(operation_tags)
            
            if path_tags:
                for tag in path_tags:
                    groups[tag].append(path)
            else:
                untagged_paths.append(path)
        
        if untagged_paths:
            groups['untagged'] = untagged_paths
        
        return dict(groups)
    
    def group_by_path_prefix(self, levels: int = 2) -> Dict[str, List[str]]:
        """
        Group paths by their path prefix.
        
        Args:
            levels: Number of path levels to use for grouping
            
        Returns:
            Dictionary mapping prefixes to lists of paths
        """
        groups = defaultdict(list)
        
        paths = self.spec.get('paths', {})
        
        for path in paths.keys():
            path_parts = [p for p in path.split('/') if p]
            
            if len(path_parts) >= levels:
                prefix = '/'.join(path_parts[:levels])
            elif path_parts:
                prefix = path_parts[0]
            else:
                prefix = 'root'
            
            groups[prefix].append(path)
        
        return dict(groups)
    
    def create_grouped_spec(self, group_name: str, paths: List[str]) -> Dict[str, Any]:
        """
        Create a new spec for a group of paths with only used components.
        
        Args:
            group_name: Name of the group
            paths: List of paths to include
            
        Returns:
            Grouped specification dictionary
        """
        grouped_spec = self.base_spec.copy()
        grouped_spec['paths'] = {}
        
        original_paths = self.spec.get('paths', {})
        
        # Add paths to grouped spec
        for path in paths:
            if path in original_paths:
                grouped_spec['paths'][path] = original_paths[path]
        
        # Handle tags for grouped spec
        if group_name != 'untagged':
            relevant_tags = []
            for tag in self.base_spec.get('tags', []):
                if isinstance(tag, dict) and tag.get('name') == group_name:
                    relevant_tags.append(tag)
            grouped_spec['tags'] = relevant_tags
        
        # Filter components
        resolver = ComponentResolver(grouped_spec)
        used_components = set()
        resolver.find_component_references(grouped_spec['paths'], used_components)
        
        # Add other spec sections that might reference components
        for section in ['security', 'tags', 'servers', 'info']:
            if section in grouped_spec:
                resolver.find_component_references(grouped_spec[section], used_components)
        
        # Resolve transitive references
        all_components = resolver.resolve_transitive_references(used_components)
        
        # Filter components
        filtered_components = resolver.filter_components(all_components)
        grouped_spec['components'] = filtered_components
        
        return grouped_spec
    
    def write_spec(self, spec: Dict[str, Any], filename: str) -> Path:
        """
        Write specification to file.
        
        Args:
            spec: Specification to write
            filename: Output filename
            
        Returns:
            Path to written file
        """
        os.makedirs(self.output_dir, exist_ok=True)
        
        if self.output_format == "json":
            filename = filename.replace('.yaml', '.json').replace('.yml', '.json')
            if not filename.endswith('.json'):
                filename += '.json'
        else:
            if not filename.endswith(('.yaml', '.yml')):
                filename += '.yaml'
        
        filepath = self.output_dir / filename
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                if self.output_format == "json":
                    json.dump(spec, f, indent=2, ensure_ascii=False)
                else:
                    yaml.dump(spec, f, default_flow_style=False, sort_keys=False,
                             allow_unicode=True, indent=2, width=1000)
            
            logger.info(f"Created: {filepath}")
            return filepath
            
        except Exception as e:
            raise OpenAPISplitterError(f"Error writing {filepath}: {e}") from e
    
    def split_by_tags(self) -> List[Path]:
        """
        Split the OpenAPI spec by tags.
        
        Returns:
            List of created file paths
        """
        if not self.spec:
            self.load_spec()
            self.create_base_spec()
        
        groups = self.group_by_tags()
        created_files = []
        
        for group_name, paths in groups.items():
            spec = self.create_grouped_spec(group_name, paths)
            safe_name = group_name.lower().replace(' ', '_').replace('/', '_')
            filename = f"{safe_name}"
            filepath = self.write_spec(spec, filename)
            created_files.append(filepath)
        
        return created_files
    
    def split_by_paths(self, levels: int = 2) -> List[Path]:
        """
        Split the OpenAPI spec by path prefixes.
        
        Args:
            levels: Number of path levels for grouping
            
        Returns:
            List of created file paths
        """
        if not self.spec:
            self.load_spec()
            self.create_base_spec()
        
        groups = self.group_by_path_prefix(levels)
        created_files = []
        
        for group_name, paths in groups.items():
            spec = self.create_grouped_spec(group_name, paths)
            safe_name = group_name.lower().replace(' ', '_').replace('/', '_')
            filename = f"{safe_name}"
            filepath = self.write_spec(spec, filename)
            created_files.append(filepath)
        
        return created_files
    
    def split(self, method: str = 'tags', path_levels: int = 2) -> List[Path]:
        """
        Main split method.
        
        Args:
            method: Splitting method ('tags' or 'paths')
            path_levels: Number of levels for path-based splitting
            
        Returns:
            List of created file paths
            
        Raises:
            OpenAPISplitterError: If method is invalid
        """
        self.load_spec()
        self.create_base_spec()
        
        logger.info(f"Splitting {self.input_file} using method: {method}")
        
        if method == 'tags':
            created_files = self.split_by_tags()
        elif method == 'paths':
            created_files = self.split_by_paths(path_levels)
        else:
            raise OpenAPISplitterError(f"Unknown split method: {method}")
        
        logger.info(f"Split complete. Created {len(created_files)} files in: {self.output_dir}")
        return created_files