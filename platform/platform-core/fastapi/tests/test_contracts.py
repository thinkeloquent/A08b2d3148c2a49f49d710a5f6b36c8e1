"""Tests for bootstrap contract utilities."""

import sys
from pathlib import Path

# Add contracts directory to path for import
contracts_dir = Path(__file__).parent.parent.parent / 'contracts'
sys.path.insert(0, str(contracts_dir))

from bootstrap_contract import (
    BootstrapConfig,
    LoaderReport,
    LoggerConfig,
    create_loader_report,
    sort_by_numeric_prefix,
    validate_bootstrap_config,
)


class TestCreateLoaderReport:
    def test_creates_report_with_name_and_zero_counts(self):
        report = create_loader_report('test-loader')
        assert report.loader == 'test-loader'
        assert report.discovered == 0
        assert report.validated == 0
        assert report.imported == 0
        assert report.registered == 0
        assert report.skipped == 0
        assert report.errors == []
        assert report.details == {}

    def test_report_is_mutable(self):
        report = create_loader_report('test')
        report.discovered = 5
        report.registered = 3
        report.errors.append({'path': 'foo', 'step': 'import', 'error': 'fail'})
        assert report.discovered == 5
        assert report.registered == 3
        assert len(report.errors) == 1


class TestSortByNumericPrefix:
    def test_sorts_single_digit_prefixes(self):
        result = sort_by_numeric_prefix(['03_c.py', '01_a.py', '02_b.py'])
        assert result == ['01_a.py', '02_b.py', '03_c.py']

    def test_sorts_mixed_digit_prefixes(self):
        input_files = [
            '100_decorators.lifecycle.py',
            '01_config.lifecycle.py',
            '20_cache.lifecycle.py',
            '490_openapi.lifecycle.py',
            '05_state.lifecycle.py',
        ]
        result = sort_by_numeric_prefix(input_files)
        assert result == [
            '01_config.lifecycle.py',
            '05_state.lifecycle.py',
            '20_cache.lifecycle.py',
            '100_decorators.lifecycle.py',
            '490_openapi.lifecycle.py',
        ]

    def test_files_without_prefix_sort_to_end(self):
        result = sort_by_numeric_prefix(['no_prefix.py', '01_first.py', 'also_none.py'])
        assert result[0] == '01_first.py'
        assert '01_first.py' not in result[1:]

    def test_handles_full_paths(self):
        input_files = [
            '/path/to/20_cache.lifecycle.py',
            '/path/to/01_config.lifecycle.py',
            '/other/05_state.lifecycle.py',
        ]
        result = sort_by_numeric_prefix(input_files)
        assert result == [
            '/path/to/01_config.lifecycle.py',
            '/other/05_state.lifecycle.py',
            '/path/to/20_cache.lifecycle.py',
        ]

    def test_empty_input(self):
        assert sort_by_numeric_prefix([]) == []

    def test_current_lifecycle_filenames(self):
        files = [
            '490_openapi_dynamic.lifecycle.py',
            '100_on_request_decorators.lifecycle.py',
            '20_cache_service.lifecycle.py',
            '09_feature_flags.lifecycle.py',
            '06_cors.lifecycle.py',
            '06_content-security-policy.lifecycle.py',
            '05_state_machine.lifecycle.py',
            '04_context_resolver.lifecycle.py',
            '03_external_compute.lifecycle.py',
            '02_create_shared_context.lifecycle.py',
            '01_app_yaml.lifecycle.py',
        ]
        result = sort_by_numeric_prefix(files)
        assert result[0] == '01_app_yaml.lifecycle.py'
        assert result[1] == '02_create_shared_context.lifecycle.py'
        assert result[-1] == '490_openapi_dynamic.lifecycle.py'


class TestValidateBootstrapConfig:
    def test_validates_valid_config(self):
        config = BootstrapConfig(port=52000)
        valid, errors = validate_bootstrap_config(config)
        assert valid is True
        assert errors == []

    def test_rejects_invalid_port(self):
        config = BootstrapConfig(port=99999)
        valid, errors = validate_bootstrap_config(config)
        assert valid is False
        assert any('port' in e for e in errors)

    def test_rejects_invalid_log_level(self):
        config = BootstrapConfig(logger=LoggerConfig(level='invalid'))
        valid, errors = validate_bootstrap_config(config)
        assert valid is False
        assert any('logger.level' in e for e in errors)


class TestBootstrapConfig:
    def test_default_values(self):
        config = BootstrapConfig()
        assert config.host == '0.0.0.0'
        assert isinstance(config.logger, LoggerConfig)
        assert config.core_plugins == []
        assert config.core_lifecycles == []
        assert config.loaders == []


class TestLoaderReport:
    def test_default_values(self):
        report = LoaderReport(loader='test')
        assert report.loader == 'test'
        assert report.discovered == 0
        assert report.errors == []
        assert report.details == {}
