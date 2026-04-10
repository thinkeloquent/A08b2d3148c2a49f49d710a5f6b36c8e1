"""Tests for proxy_url_builder — mirrors the TypeScript parity vectors."""

import pytest

from proxy_url_builder import encode_credential, build_proxy_url


class TestEncodeCredential:
    def test_simple_alphanumeric(self):
        assert encode_credential('admin') == 'admin'

    def test_encodes_at(self):
        assert encode_credential('user@domain') == 'user%40domain'

    def test_encodes_colon(self):
        assert encode_credential('a:b') == 'a%3Ab'

    def test_encodes_hash(self):
        assert encode_credential('p#ss') == 'p%23ss'

    def test_encodes_space(self):
        assert encode_credential('a b') == 'a%20b'

    def test_encodes_bang(self):
        assert encode_credential('p!ss') == 'p%21ss'

    def test_encodes_single_quote(self):
        assert encode_credential("test'user") == 'test%27user'

    def test_encodes_parens(self):
        assert encode_credential('pass(1)') == 'pass%281%29'

    def test_encodes_asterisk(self):
        assert encode_credential('pass*') == 'pass%2A'

    def test_encodes_plus_and_equals(self):
        assert encode_credential('a+b=c') == 'a%2Bb%3Dc'

    def test_encodes_ampersand(self):
        assert encode_credential('d&e') == 'd%26e'

    def test_empty_string(self):
        assert encode_credential('') == ''


class TestBuildProxyUrl:
    """Parity test vectors — must produce identical output to the TS tests."""

    @pytest.mark.parametrize(
        'user, password, proxy_url, expected',
        [
            ('admin', 'secret', 'proxy.example.com',
             'http://admin:secret@proxy.example.com'),
            ('admin', 'secret', 'proxy.example.com:8080',
             'http://admin:secret@proxy.example.com:8080'),
            ('admin', 'secret', 'http://proxy.example.com:8080',
             'http://admin:secret@proxy.example.com:8080'),
            ('user@domain', 'p@ss:word', 'proxy.example.com:3128',
             'http://user%40domain:p%40ss%3Aword@proxy.example.com:3128'),
            ('user', 'p#ss!', 'https://secure.proxy.com:443',
             'https://user:p%23ss%21@secure.proxy.com'),
            ('user name', 'pass word', 'proxy.example.com:8080',
             'http://user%20name:pass%20word@proxy.example.com:8080'),
            ('u', 'p', 'http://old:creds@proxy:8080',
             'http://u:p@proxy:8080'),
            ('a+b=c', 'd&e', 'proxy:3128',
             'http://a%2Bb%3Dc:d%26e@proxy:3128'),
            ('user', 'pass', 'http://proxy:80',
             'http://user:pass@proxy'),
            ("test'user", 'pass(1)*', 'proxy:9090',
             'http://test%27user:pass%281%29%2A@proxy:9090'),
        ],
        ids=[
            'bare-hostname',
            'hostname-port',
            'full-url',
            'special-chars-in-creds',
            'https-default-port-stripped',
            'spaces-in-creds',
            'replaces-existing-creds',
            'plus-equals-ampersand',
            'http-default-port-stripped',
            'quote-parens-asterisk',
        ],
    )
    def test_parity_vectors(self, user, password, proxy_url, expected):
        assert build_proxy_url(user, password, proxy_url) == expected


class TestBuildProxyUrlEdgeCases:
    def test_empty_credentials(self):
        assert build_proxy_url('', '', 'proxy:8080') == 'http://:@proxy:8080'

    def test_strips_trailing_path(self):
        assert build_proxy_url('user', 'pass', 'http://proxy:8080/some/path') == 'http://user:pass@proxy:8080'

    def test_strips_default_http_port(self):
        assert build_proxy_url('user', 'pass', 'http://proxy:80') == 'http://user:pass@proxy'

    def test_strips_default_https_port(self):
        assert build_proxy_url('user', 'pass', 'https://proxy:443') == 'https://user:pass@proxy'

    def test_keeps_non_default_https_port(self):
        assert build_proxy_url('user', 'pass', 'https://proxy:8443') == 'https://user:pass@proxy:8443'
