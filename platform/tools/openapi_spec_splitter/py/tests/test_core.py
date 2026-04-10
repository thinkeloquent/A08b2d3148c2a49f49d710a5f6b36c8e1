"""
Unit tests for openapi_splitter.core module.
"""

import unittest
import tempfile
import json
import yaml
import shutil
from pathlib import Path
from openapi_splitter.core import OpenAPISplitter, OpenAPISplitterError, ComponentResolver


class TestComponentResolver(unittest.TestCase):
    """Test cases for ComponentResolver class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.sample_spec = {
            'openapi': '3.0.0',
            'info': {'title': 'Test API', 'version': '1.0.0'},
            'paths': {
                '/users': {
                    'get': {
                        'responses': {
                            '200': {
                                'content': {
                                    'application/json': {
                                        'schema': {'$ref': '#/components/schemas/User'}
                                    }
                                }
                            }
                        }
                    }
                }
            },
            'components': {
                'schemas': {
                    'User': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'profile': {'$ref': '#/components/schemas/UserProfile'}
                        }
                    },
                    'UserProfile': {
                        'type': 'object',
                        'properties': {
                            'name': {'type': 'string'}
                        }
                    },
                    'UnusedSchema': {
                        'type': 'object',
                        'properties': {
                            'unused': {'type': 'string'}
                        }
                    }
                }
            }
        }
    
    def test_find_component_references(self):
        """Test finding component references in an object."""
        resolver = ComponentResolver(self.sample_spec)
        refs = set()
        
        test_obj = {
            'schema': {'$ref': '#/components/schemas/User'}
        }
        
        resolver.find_component_references(test_obj, refs)
        self.assertIn('schemas/User', refs)
    
    def test_resolve_transitive_references(self):
        """Test resolving transitive component references."""
        resolver = ComponentResolver(self.sample_spec)
        
        initial_refs = {'schemas/User'}
        all_refs = resolver.resolve_transitive_references(initial_refs)
        
        # Should include User and UserProfile (referenced by User)
        self.assertIn('schemas/User', all_refs)
        self.assertIn('schemas/UserProfile', all_refs)
        self.assertNotIn('schemas/UnusedSchema', all_refs)
    
    def test_filter_components(self):
        """Test filtering components by references."""
        resolver = ComponentResolver(self.sample_spec)
        
        used_refs = {'schemas/User', 'schemas/UserProfile'}
        filtered = resolver.filter_components(used_refs)
        
        self.assertIn('schemas', filtered)
        self.assertIn('User', filtered['schemas'])
        self.assertIn('UserProfile', filtered['schemas'])
        self.assertNotIn('UnusedSchema', filtered.get('schemas', {}))


class TestOpenAPISplitter(unittest.TestCase):
    """Test cases for OpenAPISplitter class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.sample_spec = {
            'openapi': '3.0.0',
            'info': {'title': 'Test API', 'version': '1.0.0'},
            'paths': {
                '/users': {
                    'get': {
                        'tags': ['users'],
                        'responses': {'200': {'description': 'Success'}}
                    }
                },
                '/products': {
                    'get': {
                        'tags': ['products'],
                        'responses': {'200': {'description': 'Success'}}
                    }
                },
                '/admin/settings': {
                    'get': {
                        'tags': ['admin'],
                        'responses': {'200': {'description': 'Success'}}
                    }
                },
                '/untagged': {
                    'get': {
                        'responses': {'200': {'description': 'Success'}}
                    }
                }
            },
            'components': {
                'schemas': {
                    'User': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'name': {'type': 'string'}
                        }
                    }
                }
            }
        }
        
        # Create test YAML file
        self.test_file = Path(self.temp_dir) / 'test.yaml'
        with open(self.test_file, 'w') as f:
            yaml.dump(self.sample_spec, f)
    
    def tearDown(self):
        """Clean up test fixtures."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_init_with_valid_file(self):
        """Test initialization with a valid file."""
        splitter = OpenAPISplitter(self.test_file)
        self.assertEqual(splitter.input_file, self.test_file)
        self.assertEqual(splitter.output_format, 'yaml')
    
    def test_init_with_nonexistent_file(self):
        """Test initialization with nonexistent file."""
        with self.assertRaises(OpenAPISplitterError):
            OpenAPISplitter('nonexistent.yaml')
    
    def test_init_with_invalid_format(self):
        """Test initialization with invalid output format."""
        with self.assertRaises(OpenAPISplitterError):
            OpenAPISplitter(self.test_file, output_format='xml')

    def test_init_autodetect_yaml(self):
        """Test auto-detection of YAML format."""
        splitter = OpenAPISplitter(self.test_file)
        self.assertEqual(splitter.output_format, 'yaml')
        
    def test_init_autodetect_json(self):
        """Test auto-detection of JSON format."""
        json_file = Path(self.temp_dir) / 'test.json'
        with open(json_file, 'w') as f:
            json.dump(self.sample_spec, f)
        
        splitter = OpenAPISplitter(json_file)
        self.assertEqual(splitter.output_format, 'json')
        
    def test_init_autodetect_fallback(self):
        """Test fallback to default format for unknown extension."""
        unknown_file = Path(self.temp_dir) / 'test.txt'
        with open(unknown_file, 'w') as f:
            yaml.dump(self.sample_spec, f)
            
        splitter = OpenAPISplitter(unknown_file)
        self.assertEqual(splitter.output_format, 'yaml')
        
    def test_init_override_format(self):
        """Test overriding auto-detection."""
        json_file = Path(self.temp_dir) / 'test.json'
        with open(json_file, 'w') as f:
            json.dump(self.sample_spec, f)
            
        splitter = OpenAPISplitter(json_file, output_format='yaml')
        self.assertEqual(splitter.output_format, 'yaml')
    
    def test_load_spec(self):
        """Test loading OpenAPI specification."""
        splitter = OpenAPISplitter(self.test_file)
        spec = splitter.load_spec()
        
        self.assertIsNotNone(spec)
        self.assertEqual(spec['openapi'], '3.0.0')
        self.assertIn('paths', spec)
    
    def test_load_json_spec(self):
        """Test loading JSON OpenAPI specification."""
        json_file = Path(self.temp_dir) / 'test.json'
        with open(json_file, 'w') as f:
            json.dump(self.sample_spec, f)
        
        splitter = OpenAPISplitter(json_file)
        spec = splitter.load_spec()
        
        self.assertIsNotNone(spec)
        self.assertEqual(spec['openapi'], '3.0.0')
    
    def test_create_base_spec(self):
        """Test creating base specification."""
        splitter = OpenAPISplitter(self.test_file)
        splitter.load_spec()
        base_spec = splitter.create_base_spec()
        
        self.assertIn('openapi', base_spec)
        self.assertIn('info', base_spec)
        self.assertIn('components', base_spec)
    
    def test_group_by_tags(self):
        """Test grouping paths by tags."""
        splitter = OpenAPISplitter(self.test_file)
        splitter.load_spec()
        groups = splitter.group_by_tags()
        
        self.assertIn('users', groups)
        self.assertIn('products', groups)
        self.assertIn('admin', groups)
        self.assertIn('untagged', groups)
        
        self.assertIn('/users', groups['users'])
        self.assertIn('/products', groups['products'])
        self.assertIn('/admin/settings', groups['admin'])
        self.assertIn('/untagged', groups['untagged'])
    
    def test_group_by_path_prefix(self):
        """Test grouping paths by path prefix."""
        splitter = OpenAPISplitter(self.test_file)
        splitter.load_spec()
        groups = splitter.group_by_path_prefix(levels=1)
        
        self.assertIn('users', groups)
        self.assertIn('products', groups)
        self.assertIn('admin', groups)
        self.assertIn('untagged', groups)
    
    def test_create_grouped_spec(self):
        """Test creating grouped specification."""
        splitter = OpenAPISplitter(self.test_file)
        splitter.load_spec()
        splitter.create_base_spec()
        
        spec = splitter.create_grouped_spec('users', ['/users'])
        
        self.assertIn('paths', spec)
        self.assertIn('/users', spec['paths'])
        self.assertNotIn('/products', spec['paths'])
    
    def test_write_spec_yaml(self):
        """Test writing specification as YAML."""
        splitter = OpenAPISplitter(self.test_file, output_dir=self.temp_dir)
        spec = {'openapi': '3.0.0', 'info': {'title': 'Test'}}
        
        filepath = splitter.write_spec(spec, 'test_output')
        
        self.assertTrue(filepath.exists())
        self.assertEqual(filepath.suffix, '.yaml')
        
        # Verify content
        with open(filepath, 'r') as f:
            loaded = yaml.safe_load(f)
        self.assertEqual(loaded['openapi'], '3.0.0')
    
    def test_write_spec_json(self):
        """Test writing specification as JSON."""
        splitter = OpenAPISplitter(self.test_file, output_dir=self.temp_dir, output_format='json')
        spec = {'openapi': '3.0.0', 'info': {'title': 'Test'}}
        
        filepath = splitter.write_spec(spec, 'test_output')
        
        self.assertTrue(filepath.exists())
        self.assertEqual(filepath.suffix, '.json')
        
        # Verify content
        with open(filepath, 'r') as f:
            loaded = json.load(f)
        self.assertEqual(loaded['openapi'], '3.0.0')
    
    def test_split_by_tags(self):
        """Test splitting by tags."""
        output_dir = Path(self.temp_dir) / 'tag_output'
        splitter = OpenAPISplitter(self.test_file, output_dir=output_dir)
        
        files = splitter.split_by_tags()
        
        self.assertTrue(len(files) > 0)
        for filepath in files:
            self.assertTrue(filepath.exists())
    
    def test_split_by_paths(self):
        """Test splitting by paths."""
        output_dir = Path(self.temp_dir) / 'path_output'
        splitter = OpenAPISplitter(self.test_file, output_dir=output_dir)
        
        files = splitter.split_by_paths(levels=1)
        
        self.assertTrue(len(files) > 0)
        for filepath in files:
            self.assertTrue(filepath.exists())
    
    def test_split_main_method(self):
        """Test main split method."""
        output_dir = Path(self.temp_dir) / 'split_output'
        splitter = OpenAPISplitter(self.test_file, output_dir=output_dir)
        
        # Test tags method
        files = splitter.split(method='tags')
        self.assertTrue(len(files) > 0)
        
        # Test paths method
        splitter2 = OpenAPISplitter(self.test_file, output_dir=output_dir)
        files2 = splitter2.split(method='paths')
        self.assertTrue(len(files2) > 0)
    
    def test_split_invalid_method(self):
        """Test split with invalid method."""
        splitter = OpenAPISplitter(self.test_file)
        
        with self.assertRaises(OpenAPISplitterError):
            splitter.split(method='invalid')
    
    def test_empty_spec(self):
        """Test handling empty specification."""
        empty_file = Path(self.temp_dir) / 'empty.yaml'
        with open(empty_file, 'w') as f:
            yaml.dump({}, f)
        
        splitter = OpenAPISplitter(empty_file)
        spec = splitter.load_spec()
        
        # Should load but be empty
        self.assertEqual(spec, {})
    
    def test_malformed_yaml(self):
        """Test handling malformed YAML."""
        malformed_file = Path(self.temp_dir) / 'malformed.yaml'
        with open(malformed_file, 'w') as f:
            f.write("invalid: yaml: content: [unclosed")
        
        splitter = OpenAPISplitter(malformed_file)
        
        with self.assertRaises(OpenAPISplitterError):
            splitter.load_spec()
    
    def test_component_filtering(self):
        """Test that components are properly filtered."""
        spec_with_components = {
            'openapi': '3.0.0',
            'info': {'title': 'Test API', 'version': '1.0.0'},
            'paths': {
                '/users': {
                    'get': {
                        'tags': ['users'],
                        'responses': {
                            '200': {
                                'content': {
                                    'application/json': {
                                        'schema': {'$ref': '#/components/schemas/User'}
                                    }
                                }
                            }
                        }
                    }
                },
                '/products': {
                    'get': {
                        'tags': ['products'],
                        'responses': {
                            '200': {
                                'content': {
                                    'application/json': {
                                        'schema': {'$ref': '#/components/schemas/Product'}
                                    }
                                }
                            }
                        }
                    }
                }
            },
            'components': {
                'schemas': {
                    'User': {'type': 'object'},
                    'Product': {'type': 'object'},
                    'Unused': {'type': 'object'}
                }
            }
        }
        
        comp_file = Path(self.temp_dir) / 'components.yaml'
        with open(comp_file, 'w') as f:
            yaml.dump(spec_with_components, f)
        
        output_dir = Path(self.temp_dir) / 'comp_output'
        splitter = OpenAPISplitter(comp_file, output_dir=output_dir)
        files = splitter.split(method='tags')
        
        # Check that user spec only has User schema
        for filepath in files:
            if 'users' in str(filepath):
                with open(filepath, 'r') as f:
                    user_spec = yaml.safe_load(f)
                self.assertIn('User', user_spec['components']['schemas'])
                self.assertNotIn('Product', user_spec['components']['schemas'])
                self.assertNotIn('Unused', user_spec['components']['schemas'])
                break


if __name__ == '__main__':
    unittest.main()